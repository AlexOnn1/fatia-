import { useState, useCallback } from 'react'
import { FaGithub, FaLinkedinIn, FaInstagram, FaEnvelope } from 'react-icons/fa'
import type { AppState } from './types'
import { calcular, formatBRL, PRECO_FATIA_REFERENCIA } from './utils'
import s from './App.module.css'

const INITIAL_STATE: AppState = { valorRodizio: 0, fatias: 0 }

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE)
  const [inputValue, setInputValue] = useState<string>('')
  const [editing, setEditing] = useState(false)

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
  const fatiasRestantes   = Math.max(0, fatiasParaEmpatar - state.fatias)
  const progressPct       = fatiasParaEmpatar > 0
    ? Math.min(100, Math.round((state.fatias / fatiasParaEmpatar) * 100))
    : 0
  const empatou = state.valorRodizio > 0 && fatiasRestantes === 0 && state.fatias > 0

  // Dollar sign color driven by status
  const dollarClass =
    calc.status === 'lucro'    ? s.dollarGreen
    : calc.status === 'prejuizo' ? s.dollarRed
    : ''

  const resultClass =
    calc.status === 'lucro'    ? s.lucro
    : calc.status === 'prejuizo' ? s.prejuizo
    : calc.status === 'empate'   ? s.empate
    : ''

  return (
    <div className={s.root}>

      {/* ── HEADER ── */}
      <header className={s.header}>
        <div className={s.logoLockup}>
          <span className={s.logoEmoji} aria-hidden>🍕</span>
          <div className={s.logoText}>
            <h1 className={s.wordmark}>
              Fatia<span className={`${s.dollar} ${dollarClass}`}>$</span>
            </h1>
            <p className={s.tagline}>★ Contador oficial de fatias ★</p>
          </div>
        </div>
        <p className={s.slogan}>Coma mais. Calcule tudo. Lucro sempre que der.</p>
      </header>

      <main className={s.main}>

        {/* ── VALOR PAGO ── */}
        <section className={s.card}>
          <p className={s.cardTitle}>Valor pago no rodízio</p>
          {editing ? (
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
                onBlur={() => setEditing(false)}
                autoFocus
                min={0}
                step={0.01}
                autoComplete="off"
              />
            </div>
          ) : (
            <button className={s.valorDisplay} onClick={() => setEditing(true)}>
              <span className={s.valorNum}>
                {state.valorRodizio > 0
                  ? formatBRL(state.valorRodizio)
                  : <span className={s.valorPlaceholder}>Toque para inserir</span>}
              </span>
              <span className={s.editIcon}>✏️</span>
            </button>
          )}
        </section>

        {/* ── COUNTER ── */}
        <section className={s.card}>
          <p className={s.cardTitle + ' ' + s.cardTitleRed}>Fatias consumidas</p>

          <div className={s.counter}>
            <button
              className={`${s.cBtn} ${s.cBtnMinus}`}
              onClick={handleMinus}
              disabled={state.fatias === 0}
              aria-label="Remover fatia"
            >−</button>

            <span className={s.counterNum}>{state.fatias}</span>

            <button
              className={`${s.cBtn} ${s.cBtnPlus}`}
              onClick={handlePlus}
              aria-label="Adicionar fatia"
            >+</button>
          </div>

          {/* BREAKEVEN PILL */}
          {state.valorRodizio > 0 && (
            <div className={`${s.breakevenPill} ${empatou ? s.breakevenDone : ''}`}>
              <span className={s.breakevenIcon}>{empatou ? '🎯' : '🎯'}</span>
              <span className={s.breakevenText}>
                {empatou ? (
                  <>Empatou em <strong>{fatiasParaEmpatar}</strong> {fatiasParaEmpatar === 1 ? 'fatia' : 'fatias'} — agora só lucro!</>
                ) : state.fatias === 0 ? (
                  <>Coma <strong>{fatiasParaEmpatar}</strong> fatias para recuperar o valor pago</>
                ) : (
                  <>Faltam <strong>{fatiasRestantes}</strong> {fatiasRestantes === 1 ? 'fatia' : 'fatias'} para recuperar o valor pago</>
                )}
              </span>
            </div>
          )}

          {/* Progress bar */}
          {state.valorRodizio > 0 && (
            <div className={s.progressWrap}>
              <div className={s.progressBar}>
                <div
                  className={`${s.progressFill} ${empatou ? s.progressDone : ''}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className={`${s.progressPct} ${empatou ? s.progressPctDone : ''}`}>{progressPct}%</span>
            </div>
          )}
        </section>

        {/* ── STATS ── */}
        <div className={s.stats}>
          <div className={s.stat}>
            <span className={s.statIcon}>🍕</span>
            <span className={s.statLabel}>Valor consumido</span>
            <span className={s.statVal}>
              {calc.valorConsumido !== null && calc.valorConsumido > 0
                ? formatBRL(calc.valorConsumido)
                : '—'}
            </span>
            {state.fatias > 0 && (
              <span className={s.statSub}>({state.fatias} fatias)</span>
            )}
          </div>

          <div className={s.statDivider} />

          <div className={s.stat}>
            <span className={s.statIcon}>💲</span>
            <span className={s.statLabel}>Por fatia</span>
            <span className={s.statVal}>
              {calc.porFatia !== null ? formatBRL(calc.porFatia) : '—'}
            </span>
            {calc.porFatia !== null && (
              <span className={s.statSub}>você pagou</span>
            )}
          </div>

          <div className={s.statDivider} />

          <div className={s.stat}>
            <span className={s.statIcon}>
              {calc.status === 'lucro' ? '😎' : calc.status === 'prejuizo' ? '😢' : '🤔'}
            </span>
            <span className={s.statLabel}>Lucro</span>
            <span className={`${s.statVal} ${calc.status === 'lucro' ? s.valGreen : calc.status === 'prejuizo' ? s.valRed : ''}`}>
              {calc.lucro !== null
                ? (calc.lucro >= 0 ? formatBRL(calc.lucro) : `−${formatBRL(Math.abs(calc.lucro))}`)
                : '—'}
            </span>
            {calc.status === 'lucro' && <span className={s.statSub}>sobre a pizzaria</span>}
            {calc.status === 'prejuizo' && <span className={s.statSub}>a pizzaria ganhou</span>}
          </div>
        </div>

        {/* ── RESULT BANNER ── */}
        <section className={`${s.result} ${resultClass}`}>
          {calc.status === 'neutro' && (
            <p className={s.resultMsg}>👆 Informe o valor pago para calcular seu resultado</p>
          )}
          {calc.status === 'lucro' && (
            <p className={s.resultMsg}>🎉 A pizzaria agradece... e chora por dentro!</p>
          )}
          {calc.status === 'prejuizo' && (
            <p className={s.resultMsg}>
              {state.fatias === 0
                ? '😱 Pagou e não comeu nada?! Tragédia total!'
                : `😅 Precisava ter comido mais ${fatiasRestantes} fatiinha${fatiasRestantes !== 1 ? 's' : ''}...`}
            </p>
          )}
          {calc.status === 'empate' && (
            <p className={s.resultMsg}>🤝 Empatou! Honrou cada centavo.</p>
          )}
        </section>

        {/* ── RESET ── */}
        <button className={s.reset} onClick={handleReset}>
          🗑️ Reiniciar
        </button>

      </main>

      <footer className={s.footer}>
        {/* Quote + referência */}
        <div className={s.footerQuote}>
          <p className={s.quote}>"Não é exagero se for no rodízio."</p>
        </div>
        <p className={s.footerRef}>Ref.: fatia avulsa a {formatBRL(PRECO_FATIA_REFERENCIA)} — mercado BR 2026</p>

        {/* Dev brand bar */}
        <div className={s.footerBar}>
          {/* Socials */}
          <div className={s.footerSocials}>
            <a
              className={s.footerSocialLink}
              href="https://github.com/AlexOnn1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
              style={{ '--social-hover': '#f0f0f0' } as React.CSSProperties}
            ><FaGithub /></a>
            <a
              className={s.footerSocialLink}
              href="https://www.linkedin.com/in/alexsander-albino-dev/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              style={{ '--social-hover': '#0A66C2' } as React.CSSProperties}
            ><FaLinkedinIn /></a>
            <a
              className={s.footerSocialLink}
              href="https://www.instagram.com/alexon_dev/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
              style={{ '--social-hover': '#E1306C' } as React.CSSProperties}
            ><FaInstagram /></a>
            <a
              className={s.footerSocialLink}
              href="mailto:alexsander.santos.contato@gmail.com"
              aria-label="Email"
              title="Email"
              style={{ '--social-hover': '#E63946' } as React.CSSProperties}
            ><FaEnvelope /></a>
          </div>

          {/* Copyright + stack */}
          <div className={s.footerCopy}>
            <p className={s.footerCopyText}>
              © 2026 <span>Alexsander Albino</span>. Todos os direitos reservados.
            </p>
            <p className={s.footerStack}>
              Built with <span>React</span> + <span>TypeScript</span> + <span>Vite</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
