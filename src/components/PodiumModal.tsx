import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import type { Room, RankedParticipant, TableSummary, PodiumAward } from '../types'
import {
  calculateAwards,
  generateWhatsAppShareText,
  reopenRoom,
} from '../services/roomService'
import { formatBRL } from '../utils'
import s from '../App.module.css'

interface PodiumModalProps {
  room: Room
  ranking: RankedParticipant[]
  summary: TableSummary
  isHost: boolean
  onClose: () => void
  onLeaveRoom: () => void
}

export function PodiumModal({
  room,
  ranking,
  summary,
  isHost,
  onClose,
  onLeaveRoom,
}: PodiumModalProps) {
  const [copied, setCopied] = useState(false)
  const awards: PodiumAward[] = calculateAwards(room)

  // Disparar confetes na abertura
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        })
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        })
      }, 350)
      return () => clearTimeout(timer)
    } catch {
      // ignore
    }
  }, [])

  const top1 = ranking[0]
  const top2 = ranking[1]
  const top3 = ranking[2]

  const handleShareWhatsApp = () => {
    const text = generateWhatsAppShareText(room, ranking, summary)
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const handleReopen = async () => {
    await reopenRoom(room.code)
    onClose()
  }

  return (
    <div className={s.modalBackdrop}>
      <div className={s.podiumModal}>
        <button className={s.modalCloseBtn} onClick={onClose} aria-label="Fechar">
          ✕
        </button>

        <div className={s.podiumHeader}>
          <span className={s.podiumTrophyIcon}>🏆</span>
          <h2 className={s.podiumTitle}>Fim de Jogo no Rodízio!</h2>
          <p className={s.podiumSubtitle}>{room.name}</p>
        </div>

        {/* ── PÓDIO VISUAL (1º, 2º e 3º) ── */}
        <div className={s.podiumStage}>
          {/* 2º Lugar */}
          <div className={`${s.podiumCol} ${s.podiumCol2}`}>
            {top2 ? (
              <>
                <span className={s.podiumAvatar}>{top2.emoji}</span>
                <span className={s.podiumName}>{top2.name}</span>
                <span className={s.podiumScore}>{top2.fatias} fatias</span>
                <div className={`${s.podiumPedestal} ${s.pedestal2}`}>
                  <span className={s.podiumRankNum}>2</span>
                </div>
              </>
            ) : (
              <div className={s.podiumEmpty} />
            )}
          </div>

          {/* 1º Lugar */}
          <div className={`${s.podiumCol} ${s.podiumCol1}`}>
            {top1 ? (
              <>
                <span className={s.podiumCrown}>👑</span>
                <span className={`${s.podiumAvatar} ${s.avatarGold}`}>{top1.emoji}</span>
                <span className={`${s.podiumName} ${s.nameGold}`}>{top1.name}</span>
                <span className={s.podiumScoreBold}>{top1.fatias} fatias</span>
                <div className={`${s.podiumPedestal} ${s.pedestal1}`}>
                  <span className={s.podiumRankNum}>1</span>
                </div>
              </>
            ) : null}
          </div>

          {/* 3º Lugar */}
          <div className={`${s.podiumCol} ${s.podiumCol3}`}>
            {top3 ? (
              <>
                <span className={s.podiumAvatar}>{top3.emoji}</span>
                <span className={s.podiumName}>{top3.name}</span>
                <span className={s.podiumScore}>{top3.fatias} fatias</span>
                <div className={`${s.podiumPedestal} ${s.pedestal3}`}>
                  <span className={s.podiumRankNum}>3</span>
                </div>
              </>
            ) : (
              <div className={s.podiumEmpty} />
            )}
          </div>
        </div>

        {/* ── TROFÉUS CÔMICOS ── */}
        {awards.length > 0 && (
          <div className={s.awardsSection}>
            <h3 className={s.awardsSectionTitle}>🎖️ Premiações Oficiais</h3>
            <div className={s.awardsList}>
              {awards.map((aw, idx) => (
                <div key={idx} className={s.awardCard}>
                  <span className={s.awardEmoji}>{aw.emoji}</span>
                  <div className={s.awardInfo}>
                    <p className={s.awardTitle}>{aw.title}</p>
                    <p className={s.awardDesc}>{aw.description}</p>
                    <p className={s.awardRecipient}>
                      Vencedor: <strong>{aw.recipientEmoji} {aw.recipientName}</strong> ({aw.stat})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESUMO DA MESA ── */}
        <div className={s.podiumSummaryCard}>
          <h4 className={s.podiumSummaryTitle}>📊 Balanço Final da Mesa</h4>
          <div className={s.podiumSummaryGrid}>
            <div className={s.podiumSummaryItem}>
              <span className={s.podiumSummaryLabel}>Fatias Devoradas</span>
              <span className={s.podiumSummaryVal}>{summary.totalFatias} 🍕</span>
            </div>
            <div className={s.podiumSummaryItem}>
              <span className={s.podiumSummaryLabel}>Média por Pessoa</span>
              <span className={s.podiumSummaryVal}>{summary.mediaFatias} fatias</span>
            </div>
            <div className={s.podiumSummaryItem}>
              <span className={s.podiumSummaryLabel}>Valor Consumido</span>
              <span className={s.podiumSummaryVal}>{formatBRL(summary.totalConsumido)}</span>
            </div>
            <div className={s.podiumSummaryItem}>
              <span className={s.podiumSummaryLabel}>
                {summary.lucroMesa >= 0 ? 'Prejuízo na Pizzaria' : 'Lucro da Pizzaria'}
              </span>
              <span
                className={`${s.podiumSummaryVal} ${
                  summary.lucroMesa >= 0 ? s.valGreen : s.valRed
                }`}
              >
                {summary.lucroMesa >= 0
                  ? formatBRL(summary.lucroMesa)
                  : formatBRL(Math.abs(summary.lucroMesa))}
              </span>
            </div>
          </div>
        </div>

        {/* ── AÇÕES ── */}
        <div className={s.podiumActions}>
          <button className={s.shareWhatsappBtn} onClick={handleShareWhatsApp}>
            📲 {copied ? 'Copiado & Abrindo WhatsApp!' : 'Compartilhar no WhatsApp'}
          </button>

          {isHost && (
            <button className={s.secondaryBtn} onClick={handleReopen}>
              🔄 Reabrir Mesa (Continuar Comendo)
            </button>
          )}

          <button className={s.leaveBtn} onClick={onLeaveRoom}>
            🚪 Sair da Sala
          </button>
        </div>
      </div>
    </div>
  )
}
