import avatar01 from './Avatars/avatar_01_pizza_slice.png'
import avatar02 from './Avatars/avatar_02_pizza_crown.png'
import avatar03 from './Avatars/avatar_03_bear_pizza.png'
import avatar04 from './Avatars/avatar_04_dino_pizza.png'
import avatar05 from './Avatars/avatar_05_ninja_pizza.png'
import avatar06 from './Avatars/avatar_06_hamburger.png'
import avatar07 from './Avatars/avatar_07_pig_chef.png'
import avatar08 from './Avatars/avatar_08_popsicle.png'
import avatar09 from './Avatars/avatar_09_fox_pizza.png'
import avatar10 from './Avatars/avatar_10_lightning_cheese.png'
import avatar11 from './Avatars/avatar_11_cheese_wedge.png'
import avatar12 from './Avatars/avatar_12_monkey.png'

export interface AvatarOption {
  id: string
  name: string
  src: string
  emoji: string // Fallback e emoji para WhatsApp
}

export const AVATARS: AvatarOption[] = [
  { id: 'avatar_01', name: 'Fatia Feliz', src: avatar01, emoji: '🍕' },
  { id: 'avatar_02', name: 'Rei da Pizza', src: avatar02, emoji: '👑' },
  { id: 'avatar_03', name: 'Urso Fominha', src: avatar03, emoji: '🐻' },
  { id: 'avatar_04', name: 'Dino Pizza', src: avatar04, emoji: '🦖' },
  { id: 'avatar_05', name: 'Ninja do Queijo', src: avatar05, emoji: '🥷' },
  { id: 'avatar_06', name: 'Burguer Amigo', src: avatar06, emoji: '🍔' },
  { id: 'avatar_07', name: 'Porquinho Chef', src: avatar07, emoji: '🐷' },
  { id: 'avatar_08', name: 'Picolé', src: avatar08, emoji: '🍧' },
  { id: 'avatar_09', name: 'Raposa Astuta', src: avatar09, emoji: '🦊' },
  { id: 'avatar_10', name: 'Raio Queijo', src: avatar10, emoji: '⚡' },
  { id: 'avatar_11', name: 'Queijo Derretido', src: avatar11, emoji: '🧀' },
  { id: 'avatar_12', name: 'Macaco Guloso', src: avatar12, emoji: '🐵' },
]

export const DEFAULT_HOST_AVATAR = 'avatar_02' // Rei da pizza para o anfitrião
export const DEFAULT_GUEST_AVATAR = 'avatar_01' // Fatia feliz para convidados

export function getAvatarInfo(avatarIdOrEmoji?: string): AvatarOption {
  if (!avatarIdOrEmoji) return AVATARS[0]

  // 1. Procurar por ID exato (avatar_01...)
  const byId = AVATARS.find(a => a.id === avatarIdOrEmoji)
  if (byId) return byId

  // 2. Procurar por emoji correspondente (para manter suporte a emojis antigos)
  const byEmoji = AVATARS.find(a => a.emoji === avatarIdOrEmoji)
  if (byEmoji) return byEmoji

  // 3. Fallback
  return AVATARS[0]
}

export function getAvatarEmoji(avatarIdOrEmoji?: string): string {
  const info = getAvatarInfo(avatarIdOrEmoji)
  return info.emoji || '🍕'
}
