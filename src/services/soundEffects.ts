// Web Audio API Synthesizer Profissional para o Pódio Kahoot do Fatia$
// 100% offline, zero dependência de arquivos externos, volume calibrado e sem latência.

let audioCtx: AudioContext | null = null
let muted = false

// Recupera preferência de mudo se houver
if (typeof localStorage !== 'undefined') {
  try {
    muted = localStorage.getItem('fatia_sound_muted') === 'true'
  } catch {
    // ignore
  }
}

export function isSoundMuted(): boolean {
  return muted
}

export function toggleSound(): boolean {
  muted = !muted
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('fatia_sound_muted', muted ? 'true' : 'false')
    } catch {
      // ignore
    }
  }
  return muted
}

function getAudioContext(): AudioContext | null {
  if (muted) return null
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return null
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass()
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }
    return audioCtx
  } catch {
    return null
  }
}

/** Toca uma nota com envelope suave (attack / decay) */
function playNote(
  frequency: number,
  startTime: number,
  duration: number = 0.35,
  type: OscillatorType = 'triangle',
  volume: number = 0.2
) {
  const ctx = getAudioContext()
  if (!ctx || muted) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, startTime)

    gain.gain.setValueAtTime(0.001, startTime)
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + duration)
  } catch {
    // Silencia qualquer política restrita
  }
}

/** Som de subida hidráulica rápida (Whooosh / Sweep) */
export function playWhooshRise(duration = 0.4) {
  const ctx = getAudioContext()
  if (!ctx || muted) return
  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(140, now)
    osc.frequency.exponentialRampToValueAtTime(650, now + duration)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(300, now)
    filter.frequency.exponentialRampToValueAtTime(2200, now + duration)
    filter.Q.value = 3

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
  } catch {
    // ignore
  }
}

/** Impacto seco do bloco travando no chão (Thud / Slam) */
export function playImpactThud(intensity = 0.25) {
  const ctx = getAudioContext()
  if (!ctx || muted) return
  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(120, now)
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.12)

    gain.gain.setValueAtTime(intensity, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.16)
  } catch {
    // ignore
  }
}

/** Estouro de canhão de confetes (Boom / Pop) */
export function playCannonShot() {
  const ctx = getAudioContext()
  if (!ctx || muted) return
  try {
    const now = ctx.currentTime
    // Pop agudo
    playNote(420, now, 0.08, 'triangle', 0.28)
    // Grave de impacto
    playImpactThud(0.35)
  } catch {
    // ignore
  }
}

/** Som de coroa caindo na cabeça (descida elástica + sino) */
export function playCrownDropSound() {
  const ctx = getAudioContext()
  if (!ctx || muted) return
  try {
    const now = ctx.currentTime
    // Descida rápida com quique
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(700, now)
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.1)
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.18)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.26)

    // Brilho dourado agudo no impacto da coroa
    setTimeout(() => {
      playNote(1760, ctx.currentTime, 0.35, 'triangle', 0.18)
      playNote(2637, ctx.currentTime + 0.05, 0.4, 'sine', 0.15)
    }, 180)
  } catch {
    // ignore
  }
}

/** Aplausos e torcida da multidão gerados sinteticamente via ruído filtrado */
export function playCrowdCheer(duration = 1.8, volume = 0.14) {
  const ctx = getAudioContext()
  if (!ctx || muted) return
  try {
    const bufferSize = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    // Ruído com micro-picos aleatórios simulando palmas individuais
    for (let i = 0; i < bufferSize; i++) {
      const envelope = Math.sin((i / bufferSize) * Math.PI)
      const randomClap = Math.random() > 0.96 ? 1.8 : 0.8
      data[i] = (Math.random() * 2 - 1) * envelope * randomClap
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1600
    filter.Q.value = 1.2

    const gain = ctx.createGain()
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.15)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    noise.start(now)
    noise.stop(now + duration)
  } catch {
    // ignore
  }
}

/** Revelação completa do 3º Lugar (Bronze) */
export function playBronzeReveal() {
  playWhooshRise(0.35)
  setTimeout(() => {
    playImpactThud(0.2)
    const ctx = getAudioContext()
    if (!ctx || muted) return
    const now = ctx.currentTime
    // Chime Sol4 (392Hz) -> Dó5 (523.25Hz) + brilho
    playNote(392, now, 0.22, 'triangle', 0.22)
    playNote(523.25, now + 0.12, 0.38, 'triangle', 0.26)
    playNote(1046.5, now + 0.14, 0.3, 'sine', 0.14)
    playCrowdCheer(1.2, 0.08)
  }, 280)
}

/** Revelação completa do 2º Lugar (Prata) */
export function playSilverReveal() {
  playWhooshRise(0.38)
  setTimeout(() => {
    playImpactThud(0.25)
    const ctx = getAudioContext()
    if (!ctx || muted) return
    const now = ctx.currentTime
    // Arpeggio Dó5 (523.25Hz) -> Mi5 (659.25Hz) -> Sol5 (783.99Hz)
    playNote(523.25, now, 0.16, 'triangle', 0.22)
    playNote(659.25, now + 0.1, 0.18, 'triangle', 0.25)
    playNote(783.99, now + 0.2, 0.45, 'triangle', 0.28)
    playNote(1567.98, now + 0.22, 0.35, 'sine', 0.16)
    playCrowdCheer(1.5, 0.11)
  }, 300)
}

/**
 * Toca um golpe autêntico de baqueta no tambor com corpo acústico (tom) e esteira metálica (snare rattle)
 */
function playDrumStroke(
  ctx: AudioContext,
  time: number,
  volume: number,
  pitch: number = 200,
  isRimshot: boolean = false
) {
  try {
    // 1. Corpo acústico da membrana do tambor
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(pitch, time)
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.45, time + (isRimshot ? 0.08 : 0.04))

    oscGain.gain.setValueAtTime(volume * (isRimshot ? 0.9 : 0.65), time)
    oscGain.gain.exponentialRampToValueAtTime(0.0001, time + (isRimshot ? 0.09 : 0.045))

    osc.connect(oscGain)
    oscGain.connect(ctx.destination)
    osc.start(time)
    osc.stop(time + (isRimshot ? 0.1 : 0.05))

    // 2. Esteira metálica / estalo (snare rattle) via ruído branco filtrado
    const noiseLen = isRimshot ? 0.08 : 0.035
    const bufferSize = Math.floor(ctx.sampleRate * noiseLen)
    const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const nData = noiseBuf.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      nData[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuf

    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(isRimshot ? 800 : 1400, time)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(volume * (isRimshot ? 0.8 : 0.55), time)
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + noiseLen)

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)

    noise.start(time)
    noise.stop(time + noiseLen)
  } catch {
    // ignore
  }
}

/**
 * Rufar de tambores autêntico de suspense estilo game show (Drumroll crescendo)
 * Alterna baqueta esquerda/direita com aceleração e golpe final rimshot!
 */
export function playSuspenseDrumRoll() {
  const ctx = getAudioContext()
  if (!ctx || muted) return
  try {
    const startTime = ctx.currentTime
    let t = 0
    let count = 0

    // Fase 1: Batidas iniciais deliberadas (tensão crescente)
    const initialGaps = [0.18, 0.16, 0.14, 0.12, 0.10]
    for (const gap of initialGaps) {
      const vol = 0.14 + t * 0.1
      const pitch = count % 2 === 0 ? 190 : 205
      playDrumStroke(ctx, startTime + t, vol, pitch, false)
      t += gap
      count++
    }

    // Fase 2: Rufar contínuo rápido com crescendo e aceleração (rufar de circo/suspense)
    let gap = 0.06
    while (t < 2.0) {
      const progress = t / 2.0
      const vol = 0.20 + progress * 0.24 // crescendo de 0.20 a 0.44
      const pitch = count % 2 === 0 ? 195 : 212 // baqueta esquerda x direita
      playDrumStroke(ctx, startTime + t, vol, pitch, false)
      gap = Math.max(0.027, gap * 0.96) // acelera as batidas
      t += gap
      count++
    }

    // Fase 3: Golpe final de impacto seco (Rimshot!) seguido de silêncio dramático
    playDrumStroke(ctx, startTime + 2.05, 0.48, 230, true)
  } catch {
    // ignore
  }
}

/** Mantém compatibilidade de exportação */
export const playSuspenseRiser = playSuspenseDrumRoll

/** Fanfarra Épica de Game-Show + Canhão + Aplausos da Torcida para o 1º Lugar */
export function playChampionReveal() {
  playWhooshRise(0.45)
  setTimeout(() => {
    playImpactThud(0.38)
    playCannonShot()
    playCrownDropSound()

    const ctx = getAudioContext()
    if (!ctx || muted) return
    const now = ctx.currentTime

    // MELODIA TRIUNFAL DE GAME SHOW:
    // Dó5 -> Mi5 -> Sol5 -> Dó6 -> Pausa -> Sol5 -> Lá5 -> Si5 -> Dó6 Sustentado
    const melody = [
      { f: 523.25, t: 0.00, d: 0.14, v: 0.28 },
      { f: 659.25, t: 0.12, d: 0.14, v: 0.28 },
      { f: 783.99, t: 0.24, d: 0.16, v: 0.30 },
      { f: 1046.5, t: 0.38, d: 0.26, v: 0.34 },
      // Subida final
      { f: 783.99, t: 0.68, d: 0.12, v: 0.26 },
      { f: 880.00, t: 0.80, d: 0.12, v: 0.28 },
      { f: 987.77, t: 0.92, d: 0.15, v: 0.30 },
      { f: 1046.5, t: 1.08, d: 1.40, v: 0.38 }, // Triunfo sustentado
    ]

    melody.forEach(note => {
      // Voz 1: Timbre brilhante
      playNote(note.f, now + note.t, note.d, 'triangle', note.v)
      // Voz 2: Harmônicos quentes de sopro
      playNote(note.f * 0.5, now + note.t, note.d, 'sawtooth', note.v * 0.35)
    })

    // Acorde maior glorioso sustentado no final
    playNote(1318.5, now + 1.08, 1.4, 'sine', 0.2) // Mi6
    playNote(1567.98, now + 1.08, 1.4, 'sine', 0.18) // Sol6

    // Torcida vibrando alto no momento da vitória!
    setTimeout(() => {
      playCrowdCheer(2.5, 0.2)
    }, 400)
  }, 350)
}

/** Vibração tátil no celular via navigator.vibrate */
export function triggerHaptic(pattern: number | number[] = 60) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  } catch {
    // ignore
  }
}
