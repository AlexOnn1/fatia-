import React, { useState, useCallback } from 'react'
import type { AppState } from '../types'
import { calcular, formatBRL } from '../utils'
import { useBrand } from '../context/BrandContext'
import s from '../App.module.css'

const INITIAL_STATE: AppState = { valorRodizio: 0, fatias: 0 }
const MAX_VALOR_DIGITS = 7 // cobre até R$ 9.999,99

export function SoloMode() {
  const { brand, formatUnits } = useBrand()
  const [state, setState] = useState<AppState>(INITIAL_STATE)
  const [inputValue, setInputValue] = useState<string>('')
  const [editing, setEditing] = useState(false)
  const [editingFatias, setEditingFatias] = useState(false)
  const [fatiasInput, setFatiasInput] = useState<string>('')

  const calc = calcular(state, brand.item.defaultReferencePrice)

  // ── Valor pago ──────────────────────────────────
  const handleValorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const digitsOnly = raw.replace(/[^0-9]/g, '')
    if (digitsOnly.length > MAX_VALOR_DIGITS) return
    setInputValue(raw)
    const parsed = parseFloat(raw.replace(',', '.'))
    setState(prev => ({ ...prev, valorRodizio: isNaN(parsed) ? 0 : parsed }))
  }, [])

  // ── Fatias — digitação direta ────────────────────
  const handleFatiasInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '') // só dígitos
    if (raw.length > 3) return // máx 999
    setFatiasInput(raw)
    const parsed = parseInt(raw, 10)
    setState(prev => ({ ...prev, fatias: isNaN(parsed) ? 0 : Math.max(0, parsed) }))
  }, [])

  const handleFatiasBlur = useCallback(() => {
    setEditingFatias(false)
    setFatiasInput('')
  }, [])

  // ── Botões ───────────────────────────────────────
  const handleMinus = useCallback(() => {
    setState(prev => ({ ...prev, fatias: Math.max(0, prev.fatias - 1) }))
  }, [])

  const handlePlus = useCallback(() => {
    setState(prev => ({ ...prev, fatias: prev.fatias + 1 }))
  }, [])

  const handleReset = useCallback(() => {
    setState(INITIAL_STATE)
    setInputValue('')
    setFatiasInput('')
    setEditing(false)
    setEditingFatias(false)
  }, [])

  // ── Cálculos auxiliares ──────────────────────────
  const fatiasParaEmpatar = calc.fatiasParaEmpatar ?? 0
  const fatiasRestantes = Math.max(0, fatiasParaEmpatar - state.fatias)
  const progressPct =
    fatiasParaEmpatar > 0
      ? Math.min(100, Math.round((state.fatias / fatiasParaEmpatar) * 100))
      : 0
  const empatou = state.valorRodizio > 0 && fatiasRestantes === 0 && state.fatias > 0

  const resultClass =
    calc.status === 'lucro'
      ? s.lucro
      : calc.status === 'prejuizo'
      ? s.prejuizo
      : calc.status === 'empate'
      ? s.empate
      : ''

  const cardPluralTitle = `${brand.item.plural.charAt(0).toUpperCase() + brand.item.plural.slice(1)} consumid${
    brand.item.unitGender === 'o' ? 'os' : 'as'
  }`

  const estabName =
    brand.establishmentType === 'pizzaria'
      ? 'a pizzaria'
      : brand.establishmentType === 'churrascaria'
      ? 'a churrascaria'
      : brand.establishmentType === 'hamburgueria'
      ? 'a hamburgueria'
      : 'o restaurante'

  return (
    <div className={s.soloContainer}>
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
              {state.valorRodizio > 0 ? (
                formatBRL(state.valorRodizio)
              ) : (
                <span className={s.valorPlaceholder}>Toque para inserir</span>
              )}
            </span>
            <span className={s.editIcon}>✏️</span>
          </button>
        )}
      </section>

      {/* ── COUNTER ── */}
      <section className={s.card}>
        <p className={`${s.cardTitle} ${s.cardTitleRed}`}>{cardPluralTitle}</p>

        <div className={s.counter}>
          <button
            className={`${s.cBtn} ${s.cBtnMinus}`}
            onClick={handleMinus}
            disabled={state.fatias === 0}
            aria-label={`Remover ${brand.item.singular}`}
          >
            −
          </button>

          {/* Número clicável para digitar direto */}
          {editingFatias ? (
            <input
              className={s.counterInput}
              type="number"
              inputMode="numeric"
              value={fatiasInput}
              onChange={handleFatiasInputChange}
              onBlur={handleFatiasBlur}
              autoFocus
              min={0}
              max={999}
              placeholder={String(state.fatias)}
            />
          ) : (
            <button
              className={s.counterNumBtn}
              onClick={() => {
                setFatiasInput('')
                setEditingFatias(true)
              }}
              title="Toque para digitar a quantidade"
              aria-label={`Editar número de ${brand.item.plural}`}
            >
              <span className={s.counterNum}>{state.fatias}</span>
              <span className={s.counterNumHint}>✏️</span>
            </button>
          )}

          <button
            className={`${s.cBtn} ${s.cBtnPlus}`}
            onClick={handlePlus}
            aria-label={`Adicionar ${brand.item.singular}`}
          >
            +
          </button>
        </div>

        {/* BREAKEVEN PILL */}
        {state.valorRodizio > 0 && (
          <div className={`${s.breakevenPill} ${empatou ? s.breakevenDone : ''}`}>
            <span className={s.breakevenIcon}>🎯</span>
            <span className={s.breakevenText}>
              {empatou ? (
                <>
                  Empatou em <strong>{formatUnits(fatiasParaEmpatar)}</strong> — agora só lucro!
                </>
              ) : state.fatias === 0 ? (
                <>
                  Consuma <strong>{formatUnits(fatiasParaEmpatar)}</strong> para recuperar o valor pago
                </>
              ) : (
                <>
                  Faltam <strong>{formatUnits(fatiasRestantes)}</strong> para recuperar o valor pago
                </>
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
            <span className={`${s.progressPct} ${empatou ? s.progressPctDone : ''}`}>
              {progressPct}%
            </span>
          </div>
        )}
      </section>

      {/* ── STATS ── */}
      <div className={s.stats}>
        <div className={s.stat}>
          <span className={s.statIcon}>{brand.item.emoji}</span>
          <span className={s.statLabel}>Valor consumido</span>
          <span className={s.statVal}>
            {calc.valorConsumido !== null && calc.valorConsumido > 0
              ? formatBRL(calc.valorConsumido)
              : '—'}
          </span>
          {state.fatias > 0 && <span className={s.statSub}>({formatUnits(state.fatias)})</span>}
        </div>

        <div className={s.statDivider} />

        <div className={s.stat}>
          <span className={s.statIcon}>💲</span>
          <span className={s.statLabel}>Por {brand.item.singular}</span>
          <span className={s.statVal}>
            {calc.porFatia !== null ? formatBRL(calc.porFatia) : '—'}
          </span>
          {calc.porFatia !== null && <span className={s.statSub}>você pagou</span>}
        </div>

        <div className={s.statDivider} />

        <div className={s.stat}>
          <span className={s.statIcon}>
            {calc.status === 'lucro' ? '😎' : calc.status === 'prejuizo' ? '😢' : '🤔'}
          </span>
          <span className={s.statLabel}>Lucro</span>
          <span
            className={`${s.statVal} ${
              calc.status === 'lucro'
                ? s.valGreen
                : calc.status === 'prejuizo'
                ? s.valRed
                : ''
            }`}
          >
            {calc.lucro !== null
              ? calc.lucro >= 0
                ? formatBRL(calc.lucro)
                : `−${formatBRL(Math.abs(calc.lucro))}`
              : '—'}
          </span>
          {calc.status === 'lucro' && <span className={s.statSub}>sobre {estabName}</span>}
          {calc.status === 'prejuizo' && <span className={s.statSub}>{estabName} ganhou</span>}
        </div>
      </div>

      {/* ── RESULT BANNER ── */}
      <section className={`${s.result} ${resultClass}`}>
        {calc.status === 'neutro' && (
          <p className={s.resultMsg}>👆 Informe o valor pago para calcular seu resultado</p>
        )}
        {calc.status === 'lucro' && (
          <p className={s.resultMsg}>🎉 {estabName.charAt(0).toUpperCase() + estabName.slice(1)} saiu perdendo kkkkkk!</p>
        )}
        {calc.status === 'prejuizo' && (
          <p className={s.resultMsg}>
            {state.fatias === 0
              ? 'Pagou e não consumiu nada?! Tenha vergonha >:( !'
              : `Precisava ter consumido mais ${formatUnits(fatiasRestantes)}...`}
          </p>
        )}
        {calc.status === 'empate' && (
          <p className={s.resultMsg}>🤝 Empatou! Nem vc nem {estabName}.</p>
        )}
      </section>

      {/* ── RESET ── */}
      <button className={s.reset} onClick={handleReset}>
        🗑️ Reiniciar
      </button>
    </div>
  )
}
