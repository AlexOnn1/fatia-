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
