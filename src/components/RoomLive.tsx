import { useState, useMemo } from 'react'
import type { Room } from '../types'
import {
  updateParticipantSlices,
  finishRoom,
  calculateRanking,
  calculateTableSummary,
} from '../services/roomService'
import { formatBRL } from '../utils'
import { PodiumModal } from './PodiumModal'
import { AvatarImg } from './AvatarImg'
import s from '../App.module.css'

interface RoomLiveProps {
  room: Room
  currentParticipantId: string
  onLeaveRoom: () => void
}

export function RoomLive({ room, currentParticipantId, onLeaveRoom }: RoomLiveProps) {
  const isFinished = room.status === 'finished'
  const [manualShowPodium, setManualShowPodium] = useState(false)
  const showPodium = isFinished || manualShowPodium
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  const me = room.participants?.[currentParticipantId]
  const isHost = Boolean(me?.isHost)

  const ranking = useMemo(() => calculateRanking(room), [room])
  const summary = useMemo(() => calculateTableSummary(room), [room])

  // Slice increment/decrement (desativado se o rodízio estiver encerrado)
  const handleSliceChange = async (delta: number) => {
    if (!me || isFinished) return
    const currentFatias = me.fatias || 0
    const newFatias = Math.max(0, currentFatias + delta)
    if (newFatias === currentFatias) return

    await updateParticipantSlices({
      roomCode: room.code,
      participantId: currentParticipantId,
      fatias: newFatias,
      participantName: me.name,
      participantEmoji: me.emoji,
    })
  }

  // Copy code or link
  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?sala=${room.code}`
    navigator.clipboard?.writeText(url)
    setCopyFeedback('Link copiado!')
    setTimeout(() => setCopyFeedback(null), 2000)
  }

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(room.code)
    setCopyFeedback('Código copiado!')
    setTimeout(() => setCopyFeedback(null), 2000)
  }

  const handleFinish = async () => {
    if (!isHost) return
    if (confirm('Deseja encerrar o rodízio e travar a tela de resultado para todos na mesa?')) {
      await finishRoom(room.code)
    }
  }

  // Max slices at the table for proportional bars
  const maxTableFatias = Math.max(1, ranking[0]?.fatias || 1)

  // My stats calculation
  const myRank = ranking.find(p => p.id === currentParticipantId)
  const myCalc = myRank?.calculation
  const myFatias = me?.fatias || 0
  const fatiasParaEmpatar = myCalc?.fatiasParaEmpatar ?? Math.ceil(room.valorRodizio / room.precoFatiaReferencia)
  const fatiasRestantes = Math.max(0, fatiasParaEmpatar - myFatias)
  const empatou = room.valorRodizio > 0 && fatiasRestantes === 0 && myFatias > 0

  // Recent activities
  const recentActivities = useMemo(() => {
    if (!room.activities) return []
    return Object.values(room.activities)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3)
  }, [room.activities])

  return (
    <div className={s.roomLiveContainer}>
      {/* ── HEADER DA SALA ── */}
      <div className={s.roomHeaderCard}>
        <div className={s.roomHeaderTop}>
          <div>
            <span className={isFinished ? s.roomFinishedBadge : s.roomLiveBadge}>
              {isFinished ? '🔒 RODÍZIO ENCERRADO' : '🔴 AO VIVO NA MESA'}
            </span>
            <h2 className={s.roomNameTitle}>{room.name}</h2>
          </div>
          <div className={s.roomCodeBox} onClick={handleCopyCode} title="Clique para copiar código">
            <span className={s.roomCodeLabel}>CÓDIGO:</span>
            <span className={s.roomCodeValue}>{room.code}</span>
            <span className={s.roomCopyHint}>📋</span>
          </div>
        </div>

        <div className={s.roomMetaRow}>
          <span className={s.roomMetaItem}>
            👥 {summary.participantesCount} {summary.participantesCount === 1 ? 'pessoa' : 'pessoas'}
          </span>
          <span className={s.roomMetaItem}>
            💵 R$ {room.valorRodizio.toFixed(2).replace('.', ',')}/pessoa
          </span>
          <button className={s.copyLinkBtn} onClick={handleCopyLink}>
            🔗 Convidar Amigos
          </button>
        </div>

        {copyFeedback && <div className={s.copyToast}>✅ {copyFeedback}</div>}
      </div>

      {/* ── FEED DE ATIVIDADES RECENTES ── */}
      {recentActivities.length > 0 && (
        <div className={s.activityTicker}>
          <span className={s.tickerIcon}>📢</span>
          <AvatarImg
            avatarId={recentActivities[0].participantEmoji}
            className={s.tickerAvatarImg}
          />
          <div className={s.tickerText}>
            <strong>{recentActivities[0].participantName}</strong>{' '}
            {recentActivities[0].text}
          </div>
        </div>
      )}

      {/* ── MEU PRATO (CONTADOR DO JOGADOR) ── */}
      <section className={`${s.card} ${s.myPlateCard}`}>
        <div className={s.myPlateHeader}>
          <div className={s.myPlateUser}>
            <AvatarImg avatarId={me?.emoji} className={s.myPlateAvatarImg} />
            <div>
              <p className={s.myPlateName}>{me?.name || 'Você'}</p>
              <span className={s.myPlateRankTag}>
                {myRank ? `${myRank.rank}º Lugar na Mesa` : 'Participante'}
              </span>
            </div>
          </div>
          <div className={s.myPlateStatusPill}>
            {myCalc?.status === 'lucro' ? (
              <span className={s.tagGreen}>Lucro: +{formatBRL(myCalc.lucro || 0)}</span>
            ) : empatou ? (
              <span className={s.tagGreen}>Empatou! 😎</span>
            ) : (
              <span className={s.tagRed}>Faltam {fatiasRestantes} p/ empatar</span>
            )}
          </div>
        </div>

        {/* CONTADOR GIGANTE E ERGONÔMICO */}
        <div className={s.myPlateCounter}>
          <button
            className={`${s.cBtn} ${s.cBtnMinus} ${s.cBtnLarge}`}
            onClick={() => handleSliceChange(-1)}
            disabled={myFatias === 0 || isFinished}
            aria-label="Remover fatia"
          >
            −
          </button>

          <div className={s.myPlateNumWrapper}>
            <span className={s.myPlateNum}>{myFatias}</span>
            <span className={s.myPlateUnit}>fatias comidas</span>
          </div>

          <button
            className={`${s.cBtn} ${s.cBtnPlus} ${s.cBtnLarge}`}
            onClick={() => handleSliceChange(1)}
            disabled={isFinished}
            aria-label="Adicionar fatia"
          >
            +
          </button>
        </div>

        <p className={s.myPlateHint}>
          {isFinished ? (
            <span>🔒 Rodízio encerrado pelo líder da mesa. Fatias travadas!</span>
          ) : (
            <>
              💡 Toque em <strong>+</strong> a cada nova fatia que o garçom deixar no seu prato!
            </>
          )}
        </p>
      </section>

      {/* ── PLACAR AO VIVO (RANKING DA MESA) ── */}
      <section className={s.card}>
        <div className={s.rankingHeader}>
          <h3 className={s.rankingTitle}>🏆 Ranking da Mesa</h3>
          <span className={s.rankingSubtitle}>Quem come mais?</span>
        </div>

        <div className={s.rankingList}>
          {ranking.map((participant, index) => {
            const isMe = participant.id === currentParticipantId
            const isLeader = index === 0 && participant.fatias > 0
            const pct = Math.round((participant.fatias / maxTableFatias) * 100)

            let medal = '▫️'
            if (index === 0) medal = '🥇'
            else if (index === 1) medal = '🥈'
            else if (index === 2) medal = '🥉'

            return (
              <div
                key={participant.id}
                className={`${s.rankItem} ${isMe ? s.rankItemMe : ''} ${
                  isLeader ? s.rankItemLeader : ''
                }`}
              >
                <div className={s.rankPosition}>
                  <span className={s.rankMedal}>{medal}</span>
                  <span className={s.rankNum}>{participant.rank}º</span>
                </div>

                <div className={s.rankContent}>
                  <div className={s.rankRow}>
                    <div className={s.rankUserInfo}>
                      <AvatarImg avatarId={participant.emoji} className={s.rankAvatarImg} />
                      <span className={s.rankName}>
                        {participant.name} {isMe && <strong className={s.youTag}>(Você)</strong>}
                      </span>
                    </div>
                    <div className={s.rankStats}>
                      <span className={s.rankFatiasVal}>{participant.fatias}</span>
                      <span className={s.rankFatiasLabel}>fatias</span>
                    </div>
                  </div>

                  {/* Barra comparativa de comilança */}
                  <div className={s.rankBarWrap}>
                    <div
                      className={`${s.rankBarFill} ${
                        participant.calculation.status === 'lucro'
                          ? s.rankBarFillGreen
                          : s.rankBarFillOrange
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className={s.rankFooter}>
                    <span className={s.rankConsumed}>
                      {formatBRL(participant.calculation.valorConsumido || 0)} consumidos
                    </span>
                    <span
                      className={
                        participant.calculation.status === 'lucro' ? s.valGreen : s.valRed
                      }
                    >
                      {participant.calculation.status === 'lucro'
                        ? `+${formatBRL(participant.calculation.lucro || 0)}`
                        : participant.calculation.status === 'prejuizo'
                        ? `−${formatBRL(Math.abs(participant.calculation.lucro || 0))}`
                        : 'empate'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── ESTATÍSTICAS COLETIVAS DA MESA ── */}
      <section className={s.tableStatsCard}>
        <h4 className={s.tableStatsTitle}>🍕 Rombo Coletivo na Pizzaria</h4>
        <div className={s.tableStatsGrid}>
          <div className={s.tableStatBox}>
            <span className={s.tableStatNum}>{summary.totalFatias}</span>
            <span className={s.tableStatLabel}>Fatias Devoradas</span>
          </div>
          <div className={s.tableStatBox}>
            <span className={s.tableStatNum}>{summary.mediaFatias}</span>
            <span className={s.tableStatLabel}>Média / Pessoa</span>
          </div>
          <div className={s.tableStatBox}>
            <span
              className={`${s.tableStatNum} ${
                summary.lucroMesa >= 0 ? s.valGreen : s.valRed
              }`}
            >
              {summary.lucroMesa >= 0
                ? `+${formatBRL(summary.lucroMesa)}`
                : `−${formatBRL(Math.abs(summary.lucroMesa))}`}
            </span>
            <span className={s.tableStatLabel}>
              {summary.lucroMesa >= 0 ? 'Prejuízo do Dono' : 'Lucro do Dono'}
            </span>
          </div>
        </div>
      </section>

      {/* ── BOTÕES DE AÇÃO ── */}
      <div className={s.roomActions}>
        {isHost ? (
          isFinished ? (
            <button className={s.finishBtn} onClick={() => setManualShowPodium(true)}>
              🏆 Ver Pódio Final Novamente
            </button>
          ) : (
            <button className={s.finishBtn} onClick={handleFinish}>
              🏁 Encerrar Rodízio & Ver Pódio 🏆
            </button>
          )
        ) : isFinished ? (
          <button className={s.finishBtn} onClick={() => setManualShowPodium(true)}>
            🏆 Ver Pódio dos Campeões
          </button>
        ) : (
          <div className={s.guestNoticeBox}>
            <span>👑 Apenas o criador da sala pode encerrar o rodízio</span>
          </div>
        )}

        <button className={s.leaveBtn} onClick={onLeaveRoom}>
          🚪 Sair da Mesa
        </button>
      </div>

      {/* ── MODAL DO PÓDIO (TRAVADO QUANDO FINALIZADO) ── */}
      {showPodium && (
        <PodiumModal
          room={room}
          ranking={ranking}
          summary={summary}
          isHost={isHost}
          isLocked={isFinished}
          onClose={() => setManualShowPodium(false)}
          onLeaveRoom={onLeaveRoom}
        />
      )}
    </div>
  )
}
