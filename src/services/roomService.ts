import { ref, set, get, update, onValue, off } from 'firebase/database'
import { db, isFirebaseConfigured } from './firebase'
import type {
  Room,
  Participant,
  RankedParticipant,
  TableSummary,
  PodiumAward,
  RoomActivity,
} from '../types'
import { calcular, PRECO_FATIA_REFERENCIA } from '../utils'
import { getAvatarEmoji } from '../avatars'

const ROOM_STORAGE_KEY_PREFIX = 'fatia_room_'
const PARTICIPANT_STORAGE_KEY = 'fatia_current_participant'

// Gerar código fácil de digitar no celular
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function getSavedParticipant(): { roomCode: string; participantId: string } | null {
  try {
    const raw = localStorage.getItem(PARTICIPANT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveParticipantSession(roomCode: string, participantId: string) {
  try {
    localStorage.setItem(
      PARTICIPANT_STORAGE_KEY,
      JSON.stringify({ roomCode, participantId })
    )
  } catch {
    // ignore storage errors
  }
}

export function clearParticipantSession() {
  try {
    localStorage.removeItem(PARTICIPANT_STORAGE_KEY)
  } catch {
    // ignore
  }
}

// ── LOCAL STORAGE / BROADCAST CHANNEL FALLBACK ENGINE ────────
const channels: Record<string, BroadcastChannel> = {}

function getLocalChannel(roomCode: string): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null
  if (!channels[roomCode]) {
    channels[roomCode] = new BroadcastChannel(`fatia_channel_${roomCode}`)
  }
  return channels[roomCode]
}

function getLocalRoom(roomCode: string): Room | null {
  try {
    const raw = localStorage.getItem(ROOM_STORAGE_KEY_PREFIX + roomCode)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setLocalRoom(room: Room) {
  try {
    localStorage.setItem(ROOM_STORAGE_KEY_PREFIX + room.code, JSON.stringify(room))
    const bc = getLocalChannel(room.code)
    bc?.postMessage({ type: 'ROOM_UPDATED', room })
  } catch (err) {
    console.error('Erro ao salvar sala local:', err)
  }
}

// ── ROOM OPERATIONS ──────────────────────────────────────────

export async function createRoom({
  hostName,
  emoji,
  roomName,
  valorRodizio,
}: {
  hostName: string
  emoji: string
  roomName: string
  valorRodizio: number
}): Promise<{ room: Room; participantId: string }> {
  const code = generateRoomCode()
  const participantId = 'p_' + Math.random().toString(36).substring(2, 9)
  const now = Date.now()

  const hostParticipant: Participant = {
    id: participantId,
    name: hostName.trim() || 'Líder da Mesa',
    emoji: emoji || '🍕',
    fatias: 0,
    isHost: true,
    joinedAt: now,
    updatedAt: now,
  }

  const initialActivity: RoomActivity = {
    id: 'act_' + now,
    timestamp: now,
    participantName: hostParticipant.name,
    participantEmoji: hostParticipant.emoji,
    text: 'criou a sala do rodízio! 🍕',
  }

  const newRoom: Room = {
    id: code,
    code,
    name: roomName.trim() || 'Rodízio da Galera',
    valorRodizio: valorRodizio > 0 ? valorRodizio : 69.9,
    precoFatiaReferencia: PRECO_FATIA_REFERENCIA,
    createdAt: now,
    status: 'active',
    participants: {
      [participantId]: hostParticipant,
    },
    activities: {
      [initialActivity.id]: initialActivity,
    },
  }

  if (isFirebaseConfigured && db) {
    const roomRef = ref(db, `rooms/${code}`)
    await set(roomRef, newRoom)
  } else {
    setLocalRoom(newRoom)
  }

  saveParticipantSession(code, participantId)
  return { room: newRoom, participantId }
}

export async function joinRoom({
  roomCode,
  participantName,
  emoji,
}: {
  roomCode: string
  participantName: string
  emoji: string
}): Promise<{ room: Room; participantId: string }> {
  const cleanCode = roomCode.replace(/\s+/g, '').toUpperCase()
  let room: Room | null = null

  if (isFirebaseConfigured && db) {
    const snapshot = await get(ref(db, `rooms/${cleanCode}`))
    if (snapshot.exists()) {
      room = snapshot.val() as Room
    }
  } else {
    room = getLocalRoom(cleanCode)
  }

  if (!room) {
    if (!isFirebaseConfigured) {
      throw new Error(
        'Sala não encontrada. Como o Firebase ainda não foi configurado no arquivo .env, as salas só funcionam na mesma janela do navegador. Para conectar celulares ou dispositivos diferentes, configure o Firebase!'
      )
    }
    throw new Error('Sala não encontrada. Verifique o código e tente novamente.')
  }

  const participantId = 'p_' + Math.random().toString(36).substring(2, 9)
  const now = Date.now()

  const newParticipant: Participant = {
    id: participantId,
    name: participantName.trim() || 'Comilão Misterioso',
    emoji: emoji || '🍕',
    fatias: 0,
    isHost: false,
    joinedAt: now,
    updatedAt: now,
  }

  const joinActivity: RoomActivity = {
    id: 'act_' + now,
    timestamp: now,
    participantName: newParticipant.name,
    participantEmoji: newParticipant.emoji,
    text: 'entrou na mesa para competir! 🍽️',
  }

  if (isFirebaseConfigured && db) {
    await update(ref(db, `rooms/${cleanCode}/participants/${participantId}`), newParticipant)
    await set(ref(db, `rooms/${cleanCode}/activities/${joinActivity.id}`), joinActivity)
    room.participants[participantId] = newParticipant
  } else {
    if (!room.participants) room.participants = {}
    if (!room.activities) room.activities = {}
    room.participants[participantId] = newParticipant
    room.activities[joinActivity.id] = joinActivity
    setLocalRoom(room)
  }

  saveParticipantSession(cleanCode, participantId)
  return { room, participantId }
}

export async function updateParticipantSlices({
  roomCode,
  participantId,
  fatias,
  participantName,
  participantEmoji,
}: {
  roomCode: string
  participantId: string
  fatias: number
  participantName: string
  participantEmoji: string
}): Promise<void> {
  const cleanCode = roomCode.replace(/\s+/g, '').toUpperCase()
  const validFatias = Math.max(0, fatias)
  const now = Date.now()

  const updates: Record<string, unknown> = {
    [`participants/${participantId}/fatias`]: validFatias,
    [`participants/${participantId}/updatedAt`]: now,
  }

  // Se atingiu marco notável, registrar atividade divertida
  let milestoneText: string | null = null
  if (validFatias === 5) {
    milestoneText = 'bateu 5 fatias e tá só aquecendo! 🔥'
  } else if (validFatias === 10) {
    milestoneText = 'chegou na 10ª fatia! O estômago tá roncando vitória! 🏆'
  } else if (validFatias === 15) {
    milestoneText = 'passou de 15 fatias! O gerente da pizzaria começou a suar frio! 😱'
  } else if (validFatias === 20) {
    milestoneText = '20 FATIAS! Uma lenda viva na mesa! 👑'
  }

  if (isFirebaseConfigured && db) {
    if (milestoneText) {
      const actId = 'act_' + now
      updates[`activities/${actId}`] = {
        id: actId,
        timestamp: now,
        participantName,
        participantEmoji,
        text: milestoneText,
      }
    }
    await update(ref(db, `rooms/${cleanCode}`), updates)
  } else {
    const room = getLocalRoom(cleanCode)
    if (room && room.participants && room.participants[participantId]) {
      room.participants[participantId].fatias = validFatias
      room.participants[participantId].updatedAt = now
      if (milestoneText) {
        if (!room.activities) room.activities = {}
        const actId = 'act_' + now
        room.activities[actId] = {
          id: actId,
          timestamp: now,
          participantName,
          participantEmoji,
          text: milestoneText,
        }
      }
      setLocalRoom(room)
    }
  }
}

export async function finishRoom(roomCode: string): Promise<void> {
  const cleanCode = roomCode.replace(/\s+/g, '').toUpperCase()
  if (isFirebaseConfigured && db) {
    await update(ref(db, `rooms/${cleanCode}`), { status: 'finished' })
  } else {
    const room = getLocalRoom(cleanCode)
    if (room) {
      room.status = 'finished'
      setLocalRoom(room)
    }
  }
}

export async function reopenRoom(roomCode: string): Promise<void> {
  const cleanCode = roomCode.replace(/\s+/g, '').toUpperCase()
  if (isFirebaseConfigured && db) {
    await update(ref(db, `rooms/${cleanCode}`), { status: 'active' })
  } else {
    const room = getLocalRoom(cleanCode)
    if (room) {
      room.status = 'active'
      setLocalRoom(room)
    }
  }
}

export function subscribeToRoom(
  roomCode: string,
  onUpdate: (room: Room | null) => void
): () => void {
  const cleanCode = roomCode.replace(/\s+/g, '').toUpperCase()

  if (isFirebaseConfigured && db) {
    const roomRef = ref(db, `rooms/${cleanCode}`)
    const unsubscribe = onValue(roomRef, snapshot => {
      if (snapshot.exists()) {
        onUpdate(snapshot.val() as Room)
      } else {
        onUpdate(null)
      }
    })
    return () => off(roomRef, 'value', unsubscribe)
  } else {
    // Modo local / Fallback para testes
    const initial = getLocalRoom(cleanCode)
    onUpdate(initial)

    const bc = getLocalChannel(cleanCode)
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'ROOM_UPDATED' && event.data.room?.code === cleanCode) {
        onUpdate(event.data.room)
      }
    }
    bc?.addEventListener('message', handleBroadcast)

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ROOM_STORAGE_KEY_PREFIX + cleanCode && event.newValue) {
        try {
          onUpdate(JSON.parse(event.newValue))
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener('storage', handleStorage)

    return () => {
      bc?.removeEventListener('message', handleBroadcast)
      window.removeEventListener('storage', handleStorage)
    }
  }
}

// ── RANKING & STATS HELPERS ──────────────────────────────────

export function calculateRanking(room: Room): RankedParticipant[] {
  if (!room.participants) return []
  const list = Object.values(room.participants)

  // Ordenar por fatias decrescente; desempate por quem bateu primeiro (menor updatedAt)
  list.sort((a, b) => {
    if (b.fatias !== a.fatias) {
      return b.fatias - a.fatias
    }
    return (a.updatedAt || 0) - (b.updatedAt || 0)
  })

  return list.map((p, index) => ({
    ...p,
    rank: index + 1,
    calculation: calcular({
      valorRodizio: room.valorRodizio,
      fatias: p.fatias,
    }),
  }))
}

export function calculateTableSummary(room: Room): TableSummary {
  if (!room.participants) {
    return {
      totalFatias: 0,
      totalConsumido: 0,
      totalPago: 0,
      lucroMesa: 0,
      mediaFatias: 0,
      participantesCount: 0,
    }
  }

  const participants = Object.values(room.participants)
  const count = participants.length
  const totalFatias = participants.reduce((acc, p) => acc + (p.fatias || 0), 0)
  const totalConsumido = totalFatias * (room.precoFatiaReferencia || PRECO_FATIA_REFERENCIA)
  const totalPago = count * room.valorRodizio
  const lucroMesa = totalConsumido - totalPago
  const mediaFatias = count > 0 ? Number((totalFatias / count).toFixed(1)) : 0

  return {
    totalFatias,
    totalConsumido,
    totalPago,
    lucroMesa,
    mediaFatias,
    participantesCount: count,
  }
}

export function calculateAwards(room: Room): PodiumAward[] {
  const ranking = calculateRanking(room)
  if (ranking.length === 0) return []

  const awards: PodiumAward[] = []
  const top1 = ranking[0]

  // 1. O Rei do Rodízio / Devorador Implacável
  if (top1 && top1.fatias > 0) {
    awards.push({
      title: 'O Rei do Rodízio',
      emoji: '👑',
      description: 'Comeu mais fatias que todo mundo na mesa e liderou o prejuízo!',
      recipientName: top1.name,
      recipientEmoji: top1.emoji,
      stat: `${top1.fatias} fatias devoradas`,
    })
  }

  // 2. Mão de Vaca de Ouro (Quem mais lucrou sobre a pizzaria)
  const sortedByLucro = [...ranking].sort(
    (a, b) => (b.calculation.lucro || 0) - (a.calculation.lucro || 0)
  )
  const maxLucroUser = sortedByLucro[0]
  if (maxLucroUser && (maxLucroUser.calculation.lucro || 0) > 0) {
    awards.push({
      title: 'Mão de Vaca de Ouro',
      emoji: '💸',
      description: 'Saiu com o maior lucro financeiro pessoal sobre o rodízio!',
      recipientName: maxLucroUser.name,
      recipientEmoji: maxLucroUser.emoji,
      stat: `R$ ${(maxLucroUser.calculation.lucro || 0).toFixed(2).replace('.', ',')} de lucro`,
    })
  }

  // 3. Patrocinador Oficial da Pizzaria (quem menos comeu, se houver > 1 pessoa)
  if (ranking.length > 1) {
    const lanterna = ranking[ranking.length - 1]
    if (lanterna && lanterna.fatias < top1.fatias) {
      awards.push({
        title: 'Patrocinador da Pizzaria',
        emoji: '🧯',
        description: 'Comeu pouquinho e ajudou a financiar a comilança dos amigos!',
        recipientName: lanterna.name,
        recipientEmoji: lanterna.emoji,
        stat: `Apenas ${lanterna.fatias} ${lanterna.fatias === 1 ? 'fatia' : 'fatias'}`,
      })
    }
  }

  // 4. Barriga de Concreto (15+ fatias)
  const monstros = ranking.filter(p => p.fatias >= 15)
  if (monstros.length > 0) {
    awards.push({
      title: 'Barriga de Concreto',
      emoji: '🪨',
      description: 'Rompeu a barreira das 15 fatias sem medo do dia seguinte!',
      recipientName: monstros[0].name,
      recipientEmoji: monstros[0].emoji,
      stat: `${monstros[0].fatias} fatias!`,
    })
  }

  return awards
}

export function generateWhatsAppShareText(
  room: Room,
  ranking: RankedParticipant[],
  summary: TableSummary
): string {
  const lines: string[] = []
  lines.push(`🍕 *FATIA$ — RESULTADO DO RODÍZIO* 🏆`)
  lines.push(`📍 *${room.name}* (Rodízio: R$ ${room.valorRodizio.toFixed(2).replace('.', ',')})`)
  lines.push('')
  lines.push('🏆 *CLASSIFICAÇÃO GERAL:*')

  ranking.forEach((p, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '▫️'
    const statusText =
      p.calculation.status === 'lucro'
        ? `(+R$ ${(p.calculation.lucro || 0).toFixed(2).replace('.', ',')} lucro)`
        : p.calculation.status === 'prejuizo'
        ? `(-R$ ${Math.abs(p.calculation.lucro || 0).toFixed(2).replace('.', ',')} prejuízo)`
        : '(empatou)'

    lines.push(
      `${medal} ${p.rank}º ${getAvatarEmoji(p.emoji)} *${p.name}*: ${p.fatias} fatias ${statusText}`
    )
  })

  lines.push('')
  lines.push('📊 *BALANÇO DA MESA:*')
  lines.push(`🍽️ Total consumido: ${summary.totalFatias} fatias`)
  lines.push(`📈 Média por pessoa: ${summary.mediaFatias} fatias`)
  if (summary.lucroMesa > 0) {
    lines.push(
      `💸 *Prejuízo na pizzaria:* R$ ${summary.lucroMesa.toFixed(2).replace('.', ',')} de prejuízo para o dono! 😂`
    )
  } else {
    lines.push(
      `🏪 *Vitória da pizzaria:* Lucrou R$ ${Math.abs(summary.lucroMesa).toFixed(2).replace('.', ',')} da nossa mesa! 😅`
    )
  }

  lines.push('')
  lines.push('🍕 Calcule seu rodízio também com Fatia$!')
  return lines.join('\n')
}
