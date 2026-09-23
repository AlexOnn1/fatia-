import type { TenantConfig } from '../types'

/**
 * 🍕 PRESET 1: Fatia$ (Padrão Original do Projeto)
 */
export const fatiaDefault: TenantConfig = {
  id: 'fatia',
  appName: 'Fatia$',
  slug: 'fatia',
  tagline: '★ Contador Oficial de Rodízio ★',
  slogan: 'Coma mais. Calcule tudo. Lucro sempre que der.',
  establishmentType: 'pizzaria',
  appUrl: 'https://fatias.vercel.app/',
  logoEmoji: '🍕',
  theme: {
    primary: '#E63946',
    primaryDark: '#c0202d',
    secondary: '#F4A261',
    accent: '#FFD166',
    bg: '#FFF4E6',
    surface: '#FFFFFF',
    surfaceAlt: '#FFF8F0',
    dark: '#2D2D2D',
    darkMid: '#6C757D',
  },
  item: {
    singular: 'fatia',
    plural: 'fatias',
    unitGender: 'a',
    emoji: '🍕',
    defaultReferencePrice: 8.5,
    referenceNote: 'Ref.: fatia avulsa a R$ 8,50 — mercado BR 2026',
    defaultRodizioPrice: 69.9,
  },
  footer: {
    quote: '"Não é exagero se for no rodízio."',
    establishmentName: 'Fatia$',
    showDevCredits: true,
    devName: 'alexon.dev',
    devUrl: 'https://alexon.dev',
    socialLinks: [
      { type: 'website', url: 'https://alexon.dev', label: 'Portfólio (alexon.dev)' },
      { type: 'github', url: 'https://github.com/AlexOnn1', label: 'GitHub' },
      {
        type: 'linkedin',
        url: 'https://www.linkedin.com/in/alexsander-albino-dev/',
        label: 'LinkedIn',
      },
      { type: 'instagram', url: 'https://www.instagram.com/alexon_dev/', label: 'Instagram' },
      { type: 'email', url: 'mailto:alexsander.santos.contato@gmail.com', label: 'Email' },
    ],
  },
}

/**
 * 🍕 PRESET 2: Bella Napoli (Exemplo de Pizzaria Cliente Customizada)
 */
export const bellaNapoli: TenantConfig = {
  id: 'bella-napoli',
  appName: 'Bella Napoli',
  slug: 'bella_napoli',
  tagline: '★ Rodízio Artesanal & Competição ★',
  slogan: 'Farinha italiana, forno a lenha e comilança liberada!',
  establishmentType: 'pizzaria',
  appUrl: 'https://bellanapoli.fatias.vercel.app/',
  logoEmoji: '🍕',
  theme: {
    primary: '#BA181B',
    primaryDark: '#660708',
    secondary: '#E5383B',
    accent: '#F5CB5C',
    bg: '#FAF3E0',
    surface: '#FFFFFF',
    surfaceAlt: '#F4ECE1',
    dark: '#1F1A17',
    darkMid: '#5E504A',
  },
  item: {
    singular: 'fatia',
    plural: 'fatias',
    unitGender: 'a',
    emoji: '🍕',
    defaultReferencePrice: 9.9,
    referenceNote: 'Ref.: fatia napolitana avulsa a R$ 9,90 no cardápio',
    defaultRodizioPrice: 79.9,
  },
  footer: {
    quote: '"Tradição italiana na lenha, diversão na mesa."',
    establishmentName: 'Pizzaria Bella Napoli',
    showDevCredits: false,
    socialLinks: [
      { type: 'instagram', url: 'https://instagram.com', label: 'Instagram' },
      { type: 'whatsapp', url: 'https://whatsapp.com', label: 'WhatsApp de Reservas' },
      { type: 'maps', url: 'https://maps.google.com', label: 'Como Chegar' },
    ],
  },
}

/**
 * 🍣 PRESET 3: Sushi Master (Rodízio Japonês / Temakeria)
 */
export const sushiMaster: TenantConfig = {
  id: 'sushi',
  appName: 'Sushi Master',
  slug: 'sushi_master',
  tagline: '★ Festival de Sushi & Temakis ★',
  slogan: 'Salmão fresco, sashimis ilimitados e quem come mais leva a coroa!',
  establishmentType: 'restaurante japonês',
  appUrl: 'https://sushi.fatias.vercel.app/',
  logoEmoji: '🍣',
  theme: {
    primary: '#E63946',
    primaryDark: '#9b2226',
    secondary: '#F28482',
    accent: '#84A59D',
    bg: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F3F5',
    dark: '#1C1917',
    darkMid: '#57534E',
  },
  item: {
    singular: 'peça',
    plural: 'peças',
    unitGender: 'a',
    emoji: '🍣',
    defaultReferencePrice: 4.5,
    referenceNote: 'Ref.: peça de sushi avulsa a R$ 4,50 no à la carte',
    defaultRodizioPrice: 109.9,
  },
  footer: {
    quote: '"O sushiman prepara, sua mesa devora."',
    establishmentName: 'Sushi Master Festival',
    showDevCredits: true,
    devName: 'alexon.dev',
    devUrl: 'https://alexon.dev',
    socialLinks: [
      { type: 'website', url: 'https://alexon.dev', label: 'Portfólio (alexon.dev)' },
      { type: 'instagram', url: 'https://instagram.com', label: 'Instagram' },
      { type: 'whatsapp', url: 'https://whatsapp.com', label: 'WhatsApp' },
    ],
  },
}

/**
 * 🥩 PRESET 4: Fogo Campeiro (Churrascaria de Rodízio)
 */
export const churrascariaPrime: TenantConfig = {
  id: 'churrascaria',
  appName: 'Fogo Campeiro',
  slug: 'fogo_campeiro',
  tagline: '★ Rodízio Nobre de Carnes ★',
  slogan: 'Picanha, costela de chão e desafio de comilões na brasa!',
  establishmentType: 'churrascaria',
  appUrl: 'https://fogocampeiro.fatias.vercel.app/',
  logoEmoji: '🥩',
  theme: {
    primary: '#851919',
    primaryDark: '#540D0D',
    secondary: '#B85028',
    accent: '#E09F3E',
    bg: '#FDFBF7',
    surface: '#FFFFFF',
    surfaceAlt: '#F7F2EB',
    dark: '#241E1C',
    darkMid: '#6B5E59',
  },
  item: {
    singular: 'corte',
    plural: 'cortes',
    unitGender: 'o',
    emoji: '🥩',
    defaultReferencePrice: 14.0,
    referenceNote: 'Ref.: corte nobre servido a R$ 14,00 no espeto corrido',
    defaultRodizioPrice: 129.9,
  },
  footer: {
    quote: '"O espeto não para até o último guerreiro desistir."',
    establishmentName: 'Churrascaria Fogo Campeiro',
    showDevCredits: true,
    devName: 'alexon.dev',
    devUrl: 'https://alexon.dev',
    socialLinks: [
      { type: 'website', url: 'https://alexon.dev', label: 'Portfólio (alexon.dev)' },
      { type: 'instagram', url: 'https://instagram.com', label: 'Instagram' },
      { type: 'whatsapp', url: 'https://whatsapp.com', label: 'WhatsApp' },
    ],
  },
}

/**
 * 🍔 PRESET 5: Burger Fest (Rodízio de Mini-Burgers)
 */
export const burgerFest: TenantConfig = {
  id: 'burger',
  appName: 'Burger Fest',
  slug: 'burger_fest',
  tagline: '★ Rodízio de Mini Burgers & Fritas ★',
  slogan: 'Pão brioche, blend artesanal e competição insana de hambúrguer!',
  establishmentType: 'hamburgueria',
  appUrl: 'https://burger.fatias.vercel.app/',
  logoEmoji: '🍔',
  theme: {
    primary: '#D97706',
    primaryDark: '#B45309',
    secondary: '#F59E0B',
    accent: '#10B981',
    bg: '#FFFBEB',
    surface: '#FFFFFF',
    surfaceAlt: '#FEF3C7',
    dark: '#1F2937',
    darkMid: '#4B5563',
  },
  item: {
    singular: 'burger',
    plural: 'burgers',
    unitGender: 'o',
    emoji: '🍔',
    defaultReferencePrice: 12.0,
    referenceNote: 'Ref.: mini-burger artesanal a R$ 12,00 no cardápio',
    defaultRodizioPrice: 74.9,
  },
  footer: {
    quote: '"Quantos burgers cabem antes do arrependimento?"',
    establishmentName: 'Burger Fest House',
    showDevCredits: true,
    devName: 'alexon.dev',
    devUrl: 'https://alexon.dev',
    socialLinks: [
      { type: 'website', url: 'https://alexon.dev', label: 'Portfólio (alexon.dev)' },
      { type: 'instagram', url: 'https://instagram.com', label: 'Instagram' },
      { type: 'whatsapp', url: 'https://whatsapp.com', label: 'WhatsApp' },
    ],
  },
}

/**
 * Registro de todos os tenants/modelos disponíveis
 */
export const TENANT_REGISTRY: Record<string, TenantConfig> = {
  fatia: fatiaDefault,
  default: fatiaDefault,
  'bella-napoli': bellaNapoli,
  sushi: sushiMaster,
  churrascaria: churrascariaPrime,
  burger: burgerFest,
}

/**
 * Determina o tenant ativo no momento.
 * Ordem de prioridade:
 * 1. Parâmetro na URL `?tenant=sushi` (ótimo para demos ao vivo na mesa com clientes!)
 * 2. Variável de ambiente `VITE_TENANT_ID` (no deploy da Vercel para cada cliente)
 * 3. Fallback: 'fatia' (Fatia$ padrão)
 */
export function getActiveTenant(): TenantConfig {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const tenantParam = params.get('tenant')?.toLowerCase()
    if (tenantParam && TENANT_REGISTRY[tenantParam]) {
      return TENANT_REGISTRY[tenantParam]
    }
  }

  const envTenant = (import.meta.env.VITE_TENANT_ID as string)?.toLowerCase()
  if (envTenant && TENANT_REGISTRY[envTenant]) {
    return TENANT_REGISTRY[envTenant]
  }

  return fatiaDefault
}
