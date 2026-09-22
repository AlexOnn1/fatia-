export interface AppState {
  valorRodizio: number
  fatias: number
}

export interface Calculation {
  porFatia: number | null
  valorConsumido: number | null
  lucro: number | null
  fatiasParaEmpatar: number | null
  status: 'lucro' | 'prejuizo' | 'empate' | 'neutro'
}

export interface Participant {
  id: string
  name: string
  emoji: string
  fatias: number
  isHost: boolean
  joinedAt: number
  updatedAt: number
}

export interface Room {
  id: string
  code: string
  name: string
  valorRodizio: number
  precoFatiaReferencia: number
  createdAt: number
  status: 'active' | 'finished'
  participants: Record<string, Participant>
  activities?: Record<string, RoomActivity>
}

export interface RoomActivity {
  id: string
  timestamp: number
  participantName: string
  participantEmoji: string
  text: string
}

export interface RankedParticipant extends Participant {
  rank: number
  calculation: Calculation
}

export interface TableSummary {
  totalFatias: number
  totalConsumido: number
  totalPago: number
  lucroMesa: number
  mediaFatias: number
  participantesCount: number
}

export interface PodiumAward {
  title: string
  emoji: string
  description: string
  recipientName: string
  recipientEmoji: string
  stat: string
}
