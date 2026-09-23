import type { AppState, Calculation } from './types'

/**
 * Preço médio de uma fatia de pizza avulsa no Brasil — 2026.
 * Base: pizza média ~R$68 dividida por 8 fatias = ~R$8,50/fatia.
 * Fonte: CNN Brasil / VR (gasto médio R$64–72/pedido, 2024-2025).
 */
export const PRECO_FATIA_REFERENCIA = 8.5

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

export function calcular(
  { valorRodizio, fatias }: AppState,
  precoReferencia: number = PRECO_FATIA_REFERENCIA
): Calculation {
  const valorPago = valorRodizio
  const ref = precoReferencia > 0 ? precoReferencia : PRECO_FATIA_REFERENCIA

  if (valorPago <= 0) {
    return {
      porFatia: null,
      valorConsumido: null,
      lucro: null,
      fatiasParaEmpatar: null,
      status: 'neutro',
    }
  }

  const fatiasParaEmpatar = Math.ceil(valorPago / ref)

  if (fatias === 0) {
    return {
      porFatia: null,
      valorConsumido: 0,
      lucro: -valorPago,
      fatiasParaEmpatar,
      status: 'prejuizo',
    }
  }

  const porFatia = valorPago / fatias
  const valorConsumido = fatias * ref
  const lucro = valorConsumido - valorPago

  let status: Calculation['status']
  if (Math.abs(lucro) < 0.01) {
    status = 'empate'
  } else if (lucro > 0) {
    status = 'lucro'
  } else {
    status = 'prejuizo'
  }

  return { porFatia, valorConsumido, lucro, fatiasParaEmpatar, status }
}
