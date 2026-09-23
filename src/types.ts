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
  participant2Name?: string
  participant2Emoji?: string
  type?: 'milestone' | 'overtake' | 'tie' | 'duo' | 'table' | 'join'
  badge?: string
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

export interface BrandTheme {
  primary: string
  primaryDark: string
  secondary: string
  accent: string
  bg: string
  surface: string
  surfaceAlt: string
  dark: string
  darkMid: string
  fontFamily?: string
}

export interface ItemConfig {
  singular: string
  plural: string
  unitGender: 'a' | 'o'
  emoji: string
  defaultReferencePrice: number
  referenceNote: string
  defaultRodizioPrice: number
}

export interface SocialLink {
  type: 'instagram' | 'whatsapp' | 'website' | 'maps' | 'github' | 'linkedin' | 'email'
  url: string
  label?: string
}

export interface BrandFooter {
  quote: string
  establishmentName: string
  showDevCredits: boolean
  devName?: string
  devUrl?: string
  socialLinks?: SocialLink[]
}

export interface TenantConfig {
  id: string
  appName: string
  slug: string
  tagline: string
  slogan: string
  establishmentType: string
  appUrl: string
  logoEmoji: string
  logoImageUrl?: string
  theme: BrandTheme
  item: ItemConfig
  footer: BrandFooter
}
