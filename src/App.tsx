import { useState, useCallback } from 'react'
import type { AppState } from './types'
import { calcular, formatBRL, PRECO_FATIA_REFERENCIA } from './utils'
import s from './App.module.css'

const INITIAL_STATE: AppState = { valorRodizio: 0, fatias: 0 }

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE)
  const [inputValue, setInputValue] = useState<string>('')

  const calc = calcular(state)

  const handleValorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setInputValue(raw)
    const parsed = parseFloat(raw.replace(',', '.'))
    setState(prev => ({ ...prev, valorRodizio: isNaN(parsed) ? 0 : parsed }))
  }, [])

  const handleMinus = useCallback(() => {
    setState(prev => ({ ...prev, fatias: Math.max(0, prev.fatias - 1) }))
  }, [])

  const handlePlus = useCallback(() => {
    setState(prev => ({ ...prev, fatias: prev.fatias + 1 }))
  }, [])

  const handleReset = useCallback(() => {
    setState(INITIAL_STATE)
    setInputValue('')
  }, [])

  const fatiasParaEmpatar = calc.fatiasParaEmpatar ?? 0
  const fatiasRestantes = Math.max(0, fatiasParaEmpatar - state.fatias)
  const progressPct = fatiasParaEmpatar > 0
    ? Math.min(100, Math.round((state.fatias / fatiasParaEmpatar) * 100))
    : 0
  const empatou = state.valorRodizio > 0 && fatiasRestantes === 0 && state.fatias > 0

  const resultClass =
    calc.status === 'lucro' ? s.lucro
    : calc.status === 'prejuizo' ? s.prejuizo
    : calc.status === 'empate' ? s.empate
    : ''

  return (
    <div className={s.root}>
      {/* ── HERO HEADER ── */}
      <header className={s.header}>
        <div className={s.logoLockup}>
          <span className={s.logoSlice} aria-hidden>🍕</span>
          <div className={s.logoText}>
            <span className={s.logoWordmark}>
              Fatia<span className={s.logoDollar}>$</span>
            </span>
            <span className={s.logoTagline}>rodízio de prejuízo</span>
          </div>
        </div>
      </header>

      <main className={s.main}>
        {/* ── VALOR INPUT ── */}
        <section className={s.card}>
          <label className={s.label} htmlFor="valor-input">
            Quanto você pagou?
          </label>
          <div className={s.inputWrap}>
            <span className={s.inputPrefix}>R$</span>
            <input
              id="valor-input"
              className={s.input}
              type="number"
              inputMode="decimal"
              placeholder="0,00"
              value={inputValue}
              onChange={handleValorChange}
              min={0}
              step={0.01}
              autoComplete="off"
            />
          </div>
        </section>

        {/* ── COUNTER ── */}
        <section className={s.card}>
          <p className={s.label}>Fatias devoradas</p>

          <div className={s.counter}>
            <button
              className={`${s.counterBtn} ${s.minus}`}
              onClick={handleMinus}
              disabled={state.fatias === 0}
              aria-label="Remover fatia"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="9" width="12" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>

            <div className={s.counterDisplay}>
              <span className={s.counterNum}>{state.fatias}</span>
              <span className={s.counterLabel}>
                {state.fatias === 1 ? 'fatia' : 'fatias'}
              </span>
            </div>

            <button
              className={`${s.counterBtn} ${s.plus}`}
              onClick={handlePlus}
              aria-label="Adicionar fatia"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="4" y="9" width="12" height="2" rx="1" fill="currentColor"/>
                <rect x="9" y="4" width="2" height="12" rx="1" fill="currentColor"/>
              </svg>
            </button>
          </div>

          {/* ── BREAKEVEN INDICATOR ── */}
          {state.valorRodizio > 0 && (
            <div className={s.breakeven}>
              <div className={s.breakevenHeader}>
                <span className={s.breakevenHint}>
                  {empatou
                    ? `✓ Empatou em ${fatiasParaEmpatar} ${fatiasParaEmpatar === 1 ? 'fatia' : 'fatias'} — agora é só lucro`
                    : state.fatias === 0
                      ? `Coma ${fatiasParaEmpatar} fatias para empatar`
                      : `Faltam ${fatiasRestantes} ${fatiasRestantes === 1 ? 'fatia' : 'fatias'} para empatar`
                  }
                </span>
                <span className={`${s.breakevenPct} ${empatou ? s.breakevenPctDone : ''}`}>
                  {progressPct}%
                </span>
              </div>
              <div className={s.bar}>
                <div
                  className={`${s.barFill} ${empatou ? s.barFillDone : ''}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {/* ── STATS ── */}
        <div className={s.statsRow}>
          <div className={s.stat}>
            <span className={s.statLabel}>Por fatia</span>
            <span className={s.statVal}>
              {calc.porFatia !== null ? formatBRL(calc.porFatia) : '—'}
            </span>
            <span className={s.statSub}>você pagou</span>
          </div>
          <div className={s.statDivider} />
          <div className={s.stat}>
            <span className={s.statLabel}>Consumido</span>
            <span className={s.statVal}>
              {calc.valorConsumido !== null ? formatBRL(calc.valorConsumido) : '—'}
            </span>
            <span className={s.statSub}>
              {state.fatias > 0
                ? `${state.fatias}× ${formatBRL(PRECO_FATIA_REFERENCIA)}`
                : 'valor de mercado'}
            </span>
          </div>
        </div>

        {/* ── RESULT ── */}
        <section className={`${s.result} ${resultClass}`}>
          {calc.status === 'neutro' && (
            <>
              <p className={s.resultLabel}>Lucro / Prejuízo</p>
              <p className={s.resultAmount}>—</p>
              <p className={s.resultMsg}>Informe o valor pago para ver o resultado</p>
            </>
          )}
          {calc.status === 'lucro' && (
            <>
              <p className={s.resultLabel}>Lucro sobre a pizzaria</p>
              <p className={s.resultAmount}>{formatBRL(calc.lucro!)}</p>
              <p className={s.resultMsg}>A pizzaria tomou um prejuízo com você 💪</p>
            </>
          )}
          {calc.status === 'prejuizo' && (
            <>
              <p className={s.resultLabel}>Prejuízo</p>
              <p className={s.resultAmount}>{formatBRL(Math.abs(calc.lucro!))}</p>
              <p className={s.resultMsg}>
                {state.fatias === 0
                  ? 'Pagou e não comeu nada?! Tragédia total 😭'
                  : `Faltaram ${fatiasRestantes} fatia${fatiasRestantes !== 1 ? 's' : ''} para empatar...`}
              </p>
            </>
          )}
          {calc.status === 'empate' && (
            <>
              <p className={s.resultLabel}>Empatou!</p>
              <p className={s.resultAmount}>R$ 0,00</p>
              <p className={s.resultMsg}>Pagou exatamente o preço justo. Quase ganhou!</p>
            </>
          )}
        </section>

        {/* ── RESET ── */}
        <button className={s.reset} onClick={handleReset}>
          Reiniciar
        </button>
      </main>

      <footer className={s.footer}>
        <p>Referência: fatia avulsa a {formatBRL(PRECO_FATIA_REFERENCIA)} — mercado BR 2026</p>
      </footer>
    </div>
  )
}
