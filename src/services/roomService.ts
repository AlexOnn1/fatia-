import { ref, set, get, update, onValue, off } from 'firebase/database'
import { db, isFirebaseConfigured } from './firebase'
import type {
  Room,
  Participant,
  RankedParticipant,
  TableSummary,
  PodiumAward,
  RoomActivity,
  TenantConfig,
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
  precoFatiaReferencia,
}: {
  hostName: string
  emoji: string
  roomName: string
  valorRodizio: number
  precoFatiaReferencia?: number
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
    text: 'criou a mesa de comilança! 🚀',
  }

  const refPrice =
    precoFatiaReferencia && precoFatiaReferencia > 0
      ? precoFatiaReferencia
      : PRECO_FATIA_REFERENCIA

  const newRoom: Room = {
    id: code,
    code,
    name: roomName.trim() || 'Rodízio da Galera',
    valorRodizio: valorRodizio > 0 ? valorRodizio : 69.9,
    precoFatiaReferencia: refPrice,
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

// Determinar atividades e interações divertidas entre usuários
function determineActivity(
  room: Room | null | undefined,
  participantId: string,
  newFatias: number,
  participantName: string,
  participantEmoji: string
): Omit<RoomActivity, 'id' | 'timestamp'> | null {
  if (!room) return null
  const currentP = room.participants?.[participantId]
  const oldFatias = currentP?.fatias ?? 0

  // Se reduziu ou não aumentou, não gera notificação de comilança
  if (newFatias <= oldFatias) return null

  const allParticipants = Object.values(room.participants || {})
  const otherParticipants = allParticipants.filter(p => p.id !== participantId)

  // 1. REVIRAVOLTA NA LIDERANÇA (OVERTAKE)
  if (otherParticipants.length > 0) {
    const sortedOthers = [...otherParticipants].sort((a, b) => b.fatias - a.fatias)
    const formerLeader = sortedOthers[0]

    if (formerLeader && formerLeader.fatias >= 3) {
      if (oldFatias <= formerLeader.fatias && newFatias > formerLeader.fatias) {
        return {
          participantName,
          participantEmoji,
          participant2Name: formerLeader.name,
          participant2Emoji: formerLeader.emoji,
          type: 'overtake',
          badge: '👑 REVIRAVOLTA',
          text: `acabou de ultrapassar ${formerLeader.name} e assumiu a liderança da mesa! A coroa mudou de dono! 👑⚡`,
        }
      }

      // 2. EMPATE NO TOPO (TIE AT THE TOP)
      if (oldFatias < formerLeader.fatias && newFatias === formerLeader.fatias && newFatias >= 5) {
        return {
          participantName,
          participantEmoji,
          participant2Name: formerLeader.name,
          participant2Emoji: formerLeader.emoji,
          type: 'tie',
          badge: '⚔️ RIVALIDADE',
          text: `empatou com ${formerLeader.name} em ${newFatias} fatias no topo! Disputa acirrada fatia por fatia! ⚔️🍕`,
        }
      }
    }
  }

  // 3. DUPLA MONSTRA / COMBINADA (DUO SYNERGY)
  // Ex: "Alex e Bubuo estão sem comer tem uns 3 dias! Os dois comeram 50 fatias juntos 😨"
  if (otherParticipants.length > 0) {
    const sortedOthers = [...otherParticipants].sort((a, b) => b.fatias - a.fatias)
    const topOther = sortedOthers[0]
    if (topOther && topOther.fatias >= 4 && newFatias >= 4) {
      const duoTotal = newFatias + topOther.fatias
      const oldDuoTotal = oldFatias + topOther.fatias

      const duoMilestones = [15, 25, 35, 45, 50, 60, 75, 100]
      const hitMilestone = duoMilestones.find(m => oldDuoTotal < m && duoTotal >= m)

      if (hitMilestone) {
        const duoPhrases = [
          `e ${topOther.name} estão sem comer tem uns 3 dias! Os dois comeram ${hitMilestone} fatias juntos! 😨🍽️`,
          `e ${topOther.name} formam a Dupla da Destruição: já são ${hitMilestone} fatias combinadas! O garçom tá em pânico! 🤝💥`,
          `e ${topOther.name} somam ${hitMilestone} fatias juntos! Se juntar os dois não sobra nem borda recheada na pizzaria! 🚨🍕`,
        ]
        const text = duoPhrases[Math.floor(Math.random() * duoPhrases.length)]

        return {
          participantName,
          participantEmoji,
          participant2Name: topOther.name,
          participant2Emoji: topOther.emoji,
          type: 'duo',
          badge: '😨 DUPLA MONSTRA',
          text,
        }
      }
    }
  }

  // 4. ROMBO COLETIVO DA MESA
  const totalTableSlices = allParticipants.reduce(
    (acc, p) => acc + (p.id === participantId ? newFatias : p.fatias),
    0
  )
  const oldTotalTable = allParticipants.reduce((acc, p) => acc + p.fatias, 0)
  const tableMilestones = [20, 35, 50, 75, 100, 150]
  const hitTableMilestone = tableMilestones.find(m => oldTotalTable < m && totalTableSlices >= m)

  if (hitTableMilestone && allParticipants.length > 1) {
    return {
      participantName,
      participantEmoji,
      type: 'table',
      badge: '🚨 MARCO DA MESA',
      text: `fez a mesa inteira bater ${hitTableMilestone} FATIAS coletivas! O gerente foi visto chorando no estoque! 💸😭`,
    }
  }

  // 5. BANTER COM QUEM COMEU MUITO POUCO (DIFERENÇA ABISMAL)
  if (newFatias === 10 || newFatias === 15) {
    const lanterna = [...otherParticipants].sort((a, b) => a.fatias - b.fatias)[0]
    if (lanterna && lanterna.fatias <= 2) {
      return {
        participantName,
        participantEmoji,
        participant2Name: lanterna.name,
        participant2Emoji: lanterna.emoji,
        type: 'duo',
        badge: '🐢 DIFERENÇA HISTÓRICA',
        text: `já tá na ${newFatias}ª fatia, enquanto ${lanterna.name} ainda tá com ${lanterna.fatias}... mastigando em câmera lenta ou já desistiu? 🐢🍕`,
      }
    }
  }

  // 6. MARCOS INDIVIDUAIS DE FATIAS (COM MÚLTIPLAS VARIAÇÕES DIVERTIDAS)
  const fatiasParaEmpatar = Math.ceil(room.valorRodizio / (room.precoFatiaReferencia || 8.5))

  if (newFatias === fatiasParaEmpatar && newFatias >= 4) {
    const empatePhrases = [
      '🚨 ALERTA GERAL: ACABOU DE EMPATAR A CONTA! Daqui pra frente é só prejuízo pro dono da pizzaria! 🤑📈',
      '🎯 Bateu a meta de empate! A pizzaria tá oficialmente trabalhando de graça pra ele! 💸✨',
      'cravou o empate financeiro do rodízio! Agora começa a operação lucro limpo! 🍕💰',
    ]
    return {
      participantName,
      participantEmoji,
      type: 'milestone',
      badge: '🤑 EMPATOU',
      text: empatePhrases[Math.floor(Math.random() * empatePhrases.length)],
    }
  }

  const milestonePool: Record<number, string[]> = {
    3: [
      'deu a largada e a primeira borda recheada já virou história! 🍕',
      'engrenou a 3ª fatia, o estômago acabou de acordar! 🚗💨',
      'já abriu os trabalhos com 3 fatias no bucho! 🍽️',
    ],
    5: [
      'bateu 5 fatias e garantiu para a mesa: "tô só no aquecimento!" 🔥',
      'chegou na 5ª fatia! O garçom já decorou a cara dele! 👀🍕',
      '5 fatias pra conta! Agora a comilança começou de verdade! 🍽️',
    ],
    8: [
      'já tá com 8 fatias! O gerente da pizzaria começou a passar mal na cozinha! 📉',
      '8 fatias engolidas! O botão da calça deu o primeiro estalo de alerta! 👖⚠️',
      'oitava fatia no papo! O ritmo tá impressionante! 🚀🍕',
    ],
    10: [
      'CHEGOU NOS DOIS DÍGITOS (10 fatias)! O estômago tá roncando vitória! 🏆🍕',
      '10ª fatia devorada! A mesa ao lado parou tudo pra assistir essa máquina humana! 👏🤤',
      '10 fatias! Pediu pra desabotoar o jeans com orgulho de campeão! 🏆👖',
    ],
    12: [
      'passou de uma DÚZIA de fatias (12)! Isso não é rodízio, é sequestro de mussarela! 🧀🚨',
      '12 fatias! Alguém avisa a cozinha que o buffet tá sendo saqueado! 🏃‍♂️🍕',
      'uma dúzia limpa no prato! Não passa nem água mais! 🥤💥',
    ],
    15: [
      '15 FATIAS! O garçom tá fingindo que não ouviu o chamado da mesa pra não trazer mais! 🧯💨',
      '15 fatias no bucho! A pizzaria tá cogitando fechar as portas mais cedo! 😱💸',
      '15 FATIAS! O estômago dele devia ser tombado pelo patrimônio histórico! 🏛️🍕',
    ],
    18: [
      '18 FATIAS?! Chama o SAMU ou chama mais pizza! Essa fera desafia as leis da física! 🚑🍕',
      '18 fatias! O forno a lenha não tá dando conta da velocidade de mastigação! 🚒🔥',
    ],
    20: [
      '👑 20 FATIAS! UMA LENDA VIVA NA MESA! O dono da pizzaria tá chorando no cantinho do estoque! (e o pessoal da cozinha tbm) 😭👑',
      '20 FATIAS! Alguém traz um troféu e uma ambulância pra esse passa fome! 🏆🪨',
    ],
    25: [
      '25 FATIAS?! BOA SORTE NO BANHEIRO KKKKKKKKKKKKKKKKKKKKKK! 🌋',
    ],
    30: [
      '30 FATIAS! O PROCON foi acionado, isso foi considerado assalto à pizzaria! 🚨🤯',
    ],
  }

  const pool = milestonePool[newFatias]
  if (pool && pool.length > 0) {
    const text = pool[Math.floor(Math.random() * pool.length)]
    return {
      participantName,
      participantEmoji,
      type: 'milestone',
      badge: newFatias >= 20 ? '👑 LENDA' : newFatias >= 10 ? '🏆 10 FATIAS' : '🔥 MARCO',
      text,
    }
  }

  return null
}

/**
 * Remove recursivamente valores `undefined` para evitar que o Firebase
 * Realtime Database lance erro e trave a aplicação.
 */
function sanitizePayload<T>(val: T): T {
  if (val === null || typeof val !== 'object') {
    return val
  }
  if (Array.isArray(val)) {
    return val.map(sanitizePayload) as unknown as T
  }
  const clean: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
    if (v !== undefined) {
      clean[k] = sanitizePayload(v)
    }
  }
  return clean as T
}

export async function updateParticipantSlices({
  roomCode,
  participantId,
  fatias,
  participantName,
  participantEmoji,
  currentRoom,
}: {
  roomCode: string
  participantId: string
  fatias: number
  participantName: string
  participantEmoji: string
  currentRoom?: Room
}): Promise<void> {
  const cleanCode = roomCode.replace(/\s+/g, '').toUpperCase()
  const validFatias = Math.max(0, fatias)
  const now = Date.now()

  const roomToUse = currentRoom || getLocalRoom(cleanCode)
  const activityData = determineActivity(
    roomToUse,
    participantId,
    validFatias,
    participantName,
    participantEmoji
  )

  let fullActivity: RoomActivity | null = null
  if (activityData) {
    const actId = 'act_' + now
    fullActivity = {
      id: actId,
      timestamp: now,
      participantName,
      participantEmoji,
      text: activityData.text,
    }
    if (activityData.type) fullActivity.type = activityData.type
    if (activityData.badge) fullActivity.badge = activityData.badge
    if (activityData.participant2Name) fullActivity.participant2Name = activityData.participant2Name
    if (activityData.participant2Emoji) fullActivity.participant2Emoji = activityData.participant2Emoji
  }

  if (isFirebaseConfigured && db) {
    const updates: Record<string, unknown> = {
      [`participants/${participantId}/fatias`]: validFatias,
      [`participants/${participantId}/updatedAt`]: now,
    }
    if (fullActivity) {
      updates[`activities/${fullActivity.id}`] = sanitizePayload(fullActivity)
    }
    await update(ref(db, `rooms/${cleanCode}`), sanitizePayload(updates))
  } else {
    const room = getLocalRoom(cleanCode)
    if (room) {
      if (!room.participants) room.participants = {}
      if (room.participants[participantId]) {
        room.participants[participantId].fatias = validFatias
        room.participants[participantId].updatedAt = now
      }
      if (fullActivity) {
        if (!room.activities) room.activities = {}
        room.activities[fullActivity.id] = fullActivity
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

export function calculateAwards(room: Room, brand?: TenantConfig): PodiumAward[] {
  const ranking = calculateRanking(room)
  if (ranking.length === 0) return []

  const itemPlural = brand?.item.plural || 'fatias'
  const itemSingular = brand?.item.singular || 'fatia'
  const unitGender = brand?.item.unitGender || 'a'
  const estab =
    brand?.establishmentType === 'pizzaria'
      ? 'a pizzaria'
      : brand?.establishmentType === 'churrascaria'
      ? 'a churrascaria'
      : brand?.establishmentType === 'hamburgueria'
      ? 'a hamburgueria'
      : 'o restaurante'

  const awards: PodiumAward[] = []
  const top1 = ranking[0]
  const top2 = ranking[1]

  // 1. O Rei do Rodízio / Deus Supremo do Queijo
  if (top1 && top1.fatias > 0) {
    let title = 'O Rei do Rodízio'
    let emoji = '👑'
    let desc = `Comeu mais ${itemPlural} que todo mundo na mesa e liderou o prejuízo!`
    if (top1.fatias >= 20) {
      title = brand?.establishmentType === 'restaurante japonês' ? 'Deus do Salmão' : 'Deus Supremo do Queijo'
      emoji = '🦖'
      desc = `Destruiu mais de 20 ${itemPlural} e atingiu um patamar lendário de comilança!`
    } else if (top1.fatias >= 15) {
      title = 'O Rei do Rodízio'
      emoji = '👑'
      desc = `Comandou o rombo n${estab} com maestria e fome insaciável!`
    } else if (top1.fatias >= 10) {
      title = 'Lorde da Fartura'
      emoji = '🏆'
      desc = 'Bateu os dois dígitos com estilo e levou o troféu máximo da mesa!'
    }

    awards.push({
      title,
      emoji,
      description: desc,
      recipientName: top1.name,
      recipientEmoji: top1.emoji,
      stat: `${top1.fatias} ${itemPlural} devorad${unitGender === 'o' ? 'os' : 'as'}`,
    })
  }

  // 2. Mão de Vaca de Ouro / Pesadelo do Gerente (Quem mais lucrou sobre o restaurante)
  const sortedByLucro = [...ranking].sort(
    (a, b) => (b.calculation.lucro || 0) - (a.calculation.lucro || 0)
  )
  const maxLucroUser = sortedByLucro[0]
  if (maxLucroUser && (maxLucroUser.calculation.lucro || 0) > 0) {
    const lucro = maxLucroUser.calculation.lucro || 0
    const title = lucro >= 30 ? 'Pesadelo do Gerente' : 'Mão de Vaca de Ouro'
    const emoji = lucro >= 30 ? '💸' : '💰'
    const desc =
      lucro >= 30
        ? `Arrancou mais de 30 reais de prejuízo limpo d${estab}! Um terror para o dono!`
        : 'Saiu com o maior lucro financeiro pessoal sobre o rodízio!'

    awards.push({
      title,
      emoji,
      description: desc,
      recipientName: maxLucroUser.name,
      recipientEmoji: maxLucroUser.emoji,
      stat: `R$ ${lucro.toFixed(2).replace('.', ',')} de lucro`,
    })
  }

  // 3. Patrocinador Oficial / Pagou pra Olhar (quem menos comeu)
  if (ranking.length > 1) {
    const lanterna = ranking[ranking.length - 1]
    if (lanterna && lanterna.fatias < top1.fatias) {
      const isExtreme = lanterna.fatias <= 2
      awards.push({
        title: isExtreme ? 'Pagou pra Olhar' : `Patrocinador d${estab}`,
        emoji: isExtreme ? '👀' : '🧯',
        description: isExtreme
          ? `Comeu quase nada e pagou o rodízio cheio. ${estab.charAt(0).toUpperCase() + estab.slice(1)} manda um abraço carinhoso!`
          : 'Comeu pouquinho e ajudou a financiar a comilança descontrolada dos amigos!',
        recipientName: lanterna.name,
        recipientEmoji: lanterna.emoji,
        stat: `Apenas ${lanterna.fatias} ${lanterna.fatias === 1 ? itemSingular : itemPlural}`,
      })
    }
  }

  // 4. Dupla da Destruição (Interação de Dupla no Pódio!)
  if (ranking.length >= 2 && top1 && top2) {
    const duoTotal = top1.fatias + top2.fatias
    if (duoTotal >= 16) {
      awards.push({
        title: 'Dupla da Destruição',
        emoji: '🤝',
        description: 'Parece que estavam sem comer há 3 dias! Juntos causaram a maior devastação no buffet!',
        recipientName: `${top1.name} & ${top2.name}`,
        recipientEmoji: top1.emoji,
        stat: `${duoTotal} ${itemPlural} combinad${unitGender === 'o' ? 'os' : 'as'}`,
      })
    }
  }

  // 5. Barriga de Concreto (15+ fatias individuais)
  const monstros = ranking.filter(p => p.fatias >= 15)
  if (monstros.length > 0 && monstros[0].name !== top1.name) {
    awards.push({
      title: 'Barriga de Concreto',
      emoji: '🪨',
      description: `Rompeu a barreira de 15 ${itemPlural} sem medo do dia seguinte!`,
      recipientName: monstros[0].name,
      recipientEmoji: monstros[0].emoji,
      stat: `${monstros[0].fatias} ${itemPlural}!`,
    })
  }

  // 6. Precisão Cirúrgica (Quem cravou o empate exato)
  const fatiasParaEmpatar = Math.ceil(room.valorRodizio / (room.precoFatiaReferencia || 8.5))
  const empatadores = ranking.filter(
    p => p.fatias === fatiasParaEmpatar && p.name !== top1.name
  )
  if (empatadores.length > 0) {
    const emp = empatadores[0]
    awards.push({
      title: 'Precisão Cirúrgica',
      emoji: '🎯',
      description: 'Matemática pura: não deu nem 1 centavo de lucro pro dono, nem 1 centavo a mais!',
      recipientName: emp.name,
      recipientEmoji: emp.emoji,
      stat: `Exat${unitGender === 'o' ? 'os' : 'as'} ${emp.fatias} ${emp.fatias === 1 ? itemSingular : itemPlural}`,
    })
  }

  // 7. Goleada da Mesa (Vantagem de 5+ fatias do líder sobre o 2º)
  if (ranking.length >= 2 && top1 && top2 && top1.fatias - top2.fatias >= 5) {
    awards.push({
      title: 'Goleada Histórica',
      emoji: '🌪️',
      description: `Abriu uma vantagem humilhante de ${top1.fatias - top2.fatias} ${itemPlural} sobre o segundo colocado!`,
      recipientName: top1.name,
      recipientEmoji: top1.emoji,
      stat: `+${top1.fatias - top2.fatias} ${itemPlural} à frente`,
    })
  }

  // 8. Garfada Gourmet (Dieta no rodízio)
  const dieteiros = ranking.filter(p => p.fatias > 0 && p.fatias <= 3)
  if (dieteiros.length > 0) {
    const d = dieteiros[0]
    const isLanterna = ranking.length > 1 && ranking[ranking.length - 1].name === d.name
    if (!isLanterna) {
      awards.push({
        title: 'Garfada Gourmet',
        emoji: '🥗',
        description: 'Veio pro rodízio só pra fazer presença VIP e comer que nem passarinho!',
        recipientName: d.name,
        recipientEmoji: d.emoji,
        stat: `Apenas ${d.fatias} ${d.fatias === 1 ? itemSingular : itemPlural}`,
      })
    }
  }

  return awards
}

export function generateWhatsAppShareText(
  room: Room,
  ranking: RankedParticipant[],
  summary: TableSummary,
  brand?: TenantConfig
): string {
  const itemEmoji = brand?.item.emoji || '🍕'
  const appTitle = brand?.appName?.toUpperCase() || 'FATIA$'
  const itemPlural = brand?.item.plural || 'fatias'
  const estab =
    brand?.establishmentType === 'pizzaria'
      ? 'a pizzaria'
      : brand?.establishmentType === 'churrascaria'
      ? 'a churrascaria'
      : brand?.establishmentType === 'hamburgueria'
      ? 'a hamburgueria'
      : 'o restaurante'

  const lines: string[] = []
  lines.push(`${itemEmoji} *${appTitle} — RESULTADO DO RODÍZIO* 🏆`)
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
      `${medal} ${p.rank}º ${getAvatarEmoji(p.emoji)} *${p.name}*: ${p.fatias} ${itemPlural} ${statusText}`
    )
  })

  // Incluir premiações cômicas da mesa no WhatsApp
  const awards = calculateAwards(room, brand)
  if (awards.length > 0) {
    lines.push('')
    lines.push('🎖️ *PREMIAÇÕES OFICIAIS DA MESA:*')
    awards.slice(0, 4).forEach(aw => {
      lines.push(`${aw.emoji} *${aw.title}*: ${aw.recipientName} (${aw.stat})`)
    })
  }

  lines.push('')
  lines.push('📊 *BALANÇO DA MESA:*')
  lines.push(`🍽️ Total consumido: ${summary.totalFatias} ${itemPlural}`)
  lines.push(`📈 Média por pessoa: ${summary.mediaFatias} ${itemPlural}`)
  if (summary.lucroMesa > 0) {
    lines.push(
      `💸 *Prejuízo n${estab}:* R$ ${summary.lucroMesa.toFixed(2).replace('.', ',')} de prejuízo para o dono! 😂`
    )
  } else {
    lines.push(
      `🏪 *Vitória d${estab}:* Lucrou R$ ${Math.abs(summary.lucroMesa).toFixed(2).replace('.', ',')} da nossa mesa! 😅`
    )
  }

  lines.push('')
  lines.push(`🔥 Calcule seu rodízio também: ${brand?.appUrl || 'https://fatias.vercel.app/'}`)
  lines.push('⚡ Desenvolvido por alexon.dev • https://alexon.dev')
  return lines.join('\n')
}

// ── REAÇÕES FLUTUANTES EM TEMPO REAL ──────────────────────────
export interface LiveReaction {
  id: string
  emoji: string
  senderName: string
  timestamp: number
}

export async function sendRoomReaction(
  roomCode: string,
  emoji: string,
  senderName: string
): Promise<void> {
  const reactionId = 'react_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
  const reaction: LiveReaction = {
    id: reactionId,
    emoji,
    senderName,
    timestamp: Date.now(),
  }

  // 1. Notificar canal local e abas no mesmo navegador
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fatia_local_reaction', { detail: reaction }))
  }
  const channel = getLocalChannel(roomCode)
  if (channel) {
    try {
      channel.postMessage({ type: 'reaction', reaction })
    } catch {
      // ignore
    }
  }

  // 2. Se Firebase estiver conectado, persistir efemeramente no banco
  if (isFirebaseConfigured && db) {
    try {
      const reactionsRef = ref(db, `rooms/${roomCode}/reactions/${reactionId}`)
      await set(reactionsRef, reaction)
    } catch (err) {
      console.warn('Erro ao enviar reação no Firebase:', err)
    }
  }
}

export function subscribeToRoomReactions(
  roomCode: string,
  onReaction: (reaction: LiveReaction) => void
): () => void {
  const seenIds = new Set<string>()

  // 1. Escuta local via CustomEvent
  const handleLocalEvent = (e: Event) => {
    const custom = e as CustomEvent<LiveReaction>
    if (custom.detail && !seenIds.has(custom.detail.id)) {
      seenIds.add(custom.detail.id)
      onReaction(custom.detail)
    }
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('fatia_local_reaction', handleLocalEvent)
  }

  // 2. Escuta via BroadcastChannel
  const channel = getLocalChannel(roomCode)
  const handleChannelMsg = (event: MessageEvent) => {
    if (event.data?.type === 'reaction' && event.data.reaction) {
      const react = event.data.reaction as LiveReaction
      if (!seenIds.has(react.id)) {
        seenIds.add(react.id)
        onReaction(react)
      }
    }
  }
  if (channel) {
    channel.addEventListener('message', handleChannelMsg)
  }

  // 3. Escuta via Firebase Realtime Database
  let offFirebase: (() => void) | null = null
  if (isFirebaseConfigured && db) {
    const reactionsRef = ref(db, `rooms/${roomCode}/reactions`)
    const unsub = onValue(reactionsRef, snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val() as Record<string, LiveReaction>
        const now = Date.now()
        Object.values(data).forEach(react => {
          // Reações dos últimos 8 segundos
          if (react && react.id && !seenIds.has(react.id) && now - react.timestamp < 8000) {
            seenIds.add(react.id)
            onReaction(react)
          }
        })
      }
    })
    offFirebase = () => off(reactionsRef, 'value', unsub)
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('fatia_local_reaction', handleLocalEvent)
    }
    if (channel) {
      channel.removeEventListener('message', handleChannelMsg)
    }
    if (offFirebase) {
      offFirebase()
    }
  }
}

