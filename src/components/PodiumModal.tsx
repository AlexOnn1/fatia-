import { useEffect, useState, useRef } from 'react'
import confetti from 'canvas-confetti'
import { toBlob } from 'html-to-image'
import type { Room, RankedParticipant, TableSummary, PodiumAward } from '../types'
import {
  calculateAwards,
  generateWhatsAppShareText,
  reopenRoom,
} from '../services/roomService'
import { formatBRL } from '../utils'
import { AvatarImg } from './AvatarImg'
import { ShareCards } from './ShareCards'
import s from '../App.module.css'

interface PodiumModalProps {
  room: Room
  ranking: RankedParticipant[]
  summary: TableSummary
  isHost: boolean
  isLocked?: boolean
  onClose: () => void
  onLeaveRoom: () => void
}

export function PodiumModal({
  room,
  ranking,
  summary,
  isHost,
  isLocked = false,
  onClose,
  onLeaveRoom,
}: PodiumModalProps) {
  const [generatingImages, setGeneratingImages] = useState(false)
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null)
  const awards: PodiumAward[] = calculateAwards(room)

  const cardsRef = useRef<{
    podiumRef: HTMLDivElement | null
    rankingRef: HTMLDivElement | null
  }>({
    podiumRef: null,
    rankingRef: null,
  })

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

  const [cachedImages, setCachedImages] = useState<{
    podiumBlob: Blob
    rankingBlob: Blob
    podiumFile: File
    rankingFile: File
    cleanTitle: string
  } | null>(null)

  const top1 = ranking[0]
  const top2 = ranking[1]
  const top3 = ranking[2]

  // Função auxiliar para gerar blobs e arquivos de imagem em alta definição
  const generateImagesAsync = async () => {
    const { podiumRef, rankingRef } = cardsRef.current
    if (!podiumRef || !rankingRef) return null

    const podiumBlob = await toBlob(podiumRef, { quality: 0.95, pixelRatio: 2 })
    const rankingBlob = await toBlob(rankingRef, { quality: 0.95, pixelRatio: 2 })
    if (!podiumBlob || !rankingBlob) return null

    const cleanTitle = (room.name || room.code).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    const podiumFile = new File([podiumBlob], `fatia_${cleanTitle}_podio.png`, {
      type: 'image/png',
    })
    const rankingFile = new File([rankingBlob], `fatia_${cleanTitle}_ranking.png`, {
      type: 'image/png',
    })

    return { podiumBlob, rankingBlob, podiumFile, rankingFile, cleanTitle }
  }

  // Pré-renderizar imagens em segundo plano logo na abertura do pódio
  useEffect(() => {
    let active = true
    const timer = setTimeout(async () => {
      try {
        const res = await generateImagesAsync()
        if (res && active) {
          setCachedImages(res)
        }
      } catch (err) {
        console.warn('Pré-renderização de imagens:', err)
      }
    }, 450)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [room.name, room.code, ranking, summary, awards])

  // Função para salvar blob na pasta Downloads do dispositivo
  const saveBlobToDownloads = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 3000)
  }

  // Baixar as duas imagens em sequência com pequeno delay
  const triggerDownloadBoth = (pBlob: Blob, rBlob: Blob, prefix: string) => {
    saveBlobToDownloads(pBlob, `fatia_${prefix}_podio.png`)
    setTimeout(() => {
      saveBlobToDownloads(rBlob, `fatia_${prefix}_ranking.png`)
    }, 350)
  }

  // Abrir o WhatsApp (app nativo no mobile ou WhatsApp Web no desktop)
  const openWhatsAppUrl = (text: string) => {
    const encoded = encodeURIComponent(text)
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (isMobile) {
      window.location.href = `whatsapp://send?text=${encoded}`
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank')
    }
  }

  // Compartilhar apenas texto no WhatsApp
  const handleShareWhatsAppTextOnly = () => {
    const text = generateWhatsAppShareText(room, ranking, summary)
    navigator.clipboard?.writeText(text)
    setStatusFeedback('Texto copiado! Abrindo WhatsApp...')

    setTimeout(() => {
      openWhatsAppUrl(text)
    }, 400)
  }

  // Compartilhar com imagens (Salva em Downloads e engatilha no WhatsApp)
  const handleShareWithImages = async () => {
    setGeneratingImages(true)
    setStatusFeedback('Salvando 2 imagens e abrindo WhatsApp... 🍕')

    try {
      let images = cachedImages
      if (!images) {
        images = await generateImagesAsync()
      }

      if (!images) {
        throw new Error('Falha ao renderizar imagens do pódio e ranking.')
      }

      const { podiumBlob, rankingBlob, podiumFile, rankingFile, cleanTitle } = images
      const text = generateWhatsAppShareText(room, ranking, summary)

      // Verificar suporte nativo de compartilhamento de múltiplos arquivos (celulares modernos via HTTPS)
      const canShareFiles =
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [podiumFile, rankingFile] })

      if (canShareFiles) {
        try {
          // 1. Aciona o Web Share imediatamente no clique do usuário (para não expirar o gesto)
          const sharePromise = navigator.share({
            title: `Resultado do Rodízio - ${room.name} 🍕`,
            text,
            files: [podiumFile, rankingFile],
          })

          // 2. Dispara o download automático para a pasta Downloads do aparelho
          setTimeout(() => {
            triggerDownloadBoth(podiumBlob, rankingBlob, cleanTitle)
          }, 250)

          await sharePromise
          setStatusFeedback('✅ 2 Imagens salvas em Downloads e enviadas para o WhatsApp!')
          return
        } catch (shareErr) {
          if (shareErr instanceof Error && shareErr.name === 'AbortError') {
            setStatusFeedback('📸 Imagens salvas na sua pasta de Downloads!')
            return
          }
          console.warn('Web Share falhou ou foi cancelado:', shareErr)
        }
      }

      // Fallback para desktop ou navegadores sem envio nativo direto de arquivos:
      // 1. Salva automaticamente as duas imagens na pasta Downloads
      triggerDownloadBoth(podiumBlob, rankingBlob, cleanTitle)

      // 2. Copia o resumo em texto para a área de transferência
      navigator.clipboard?.writeText(text)
      setStatusFeedback('📸 2 Imagens salvas em Downloads! Abrindo WhatsApp...')

      // 3. Abre o WhatsApp com o texto pronto
      setTimeout(() => {
        openWhatsAppUrl(text)
      }, 700)
    } catch (err) {
      console.error('Erro ao compartilhar imagens:', err)
      setStatusFeedback('Não foi possível gerar imagens. Abrindo WhatsApp com texto...')
      handleShareWhatsAppTextOnly()
    } finally {
      setGeneratingImages(false)
      setTimeout(() => setStatusFeedback(null), 5000)
    }
  }

  // Baixar diretamente as duas imagens avulsas
  const handleDownloadImages = async () => {
    setGeneratingImages(true)
    setStatusFeedback('Baixando as 2 imagens em PNG para Downloads...')

    try {
      let images = cachedImages
      if (!images) {
        images = await generateImagesAsync()
      }

      if (images) {
        triggerDownloadBoth(images.podiumBlob, images.rankingBlob, images.cleanTitle)
        setStatusFeedback('✅ Imagem do Pódio e do Ranking salvas na pasta Downloads!')
      }
    } catch (err) {
      console.error(err)
      setStatusFeedback('Erro ao baixar imagens.')
    } finally {
      setGeneratingImages(false)
      setTimeout(() => setStatusFeedback(null), 3500)
    }
  }

  const handleReopen = async () => {
    await reopenRoom(room.code)
    onClose()
  }

  return (
    <div className={s.modalBackdrop}>
      <div className={s.podiumModal}>
        {!isLocked && (
          <button className={s.modalCloseBtn} onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        )}

        <div className={s.podiumHeader}>
          <span className={s.podiumTrophyIcon}>🏆</span>
          <h2 className={s.podiumTitle}>Fim de Jogo no Rodízio!</h2>
          <p className={s.podiumSubtitle}>{room.name}</p>
          {isLocked && (
            <div className={s.podiumLockedNotice}>
              🔒 <strong>Rodízio Finalizado!</strong>
              <span>Resultado oficial travado pelo criador da sala.</span>
            </div>
          )}
        </div>

        {/* ── PÓDIO VISUAL (1º, 2º e 3º) ── */}
        <div className={s.podiumStage}>
          {/* 2º Lugar */}
          <div className={`${s.podiumCol} ${s.podiumCol2}`}>
            {top2 ? (
              <>
                <AvatarImg avatarId={top2.emoji} className={s.podiumAvatarImg} />
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
                <AvatarImg
                  avatarId={top1.emoji}
                  className={`${s.podiumAvatarImg} ${s.avatarGoldImg}`}
                />
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
                <AvatarImg avatarId={top3.emoji} className={s.podiumAvatarImg} />
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
                    <div className={s.awardRecipientRow}>
                      <span className={s.awardRecipientLabel}>Vencedor:</span>
                      <AvatarImg
                        avatarId={aw.recipientEmoji}
                        className={s.awardRecipientAvatar}
                      />
                      <strong className={s.awardRecipientName}>{aw.recipientName}</strong>
                      <span className={s.awardRecipientStat}>({aw.stat})</span>
                    </div>
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

        {/* ── AÇÕES COM GERAÇÃO DE IMAGENS ── */}
        <div className={s.podiumActions}>
          <button
            className={s.shareWhatsappBtn}
            onClick={handleShareWithImages}
            disabled={generatingImages}
          >
            {generatingImages ? (
              '⏳ Salvando e Abrindo WhatsApp...'
            ) : (
              '📲 Compartilhar no WhatsApp (Salvar 2 Imagens & Enviar)'
            )}
          </button>

          <div className={s.secondaryShareRow}>
            <button
              className={s.downloadImgsBtn}
              onClick={handleDownloadImages}
              disabled={generatingImages}
              title="Salvar imagens no seu celular ou computador"
            >
              📥 Baixar 2 Imagens (Pódio + Ranking)
            </button>
            <button
              className={s.textOnlyBtn}
              onClick={handleShareWhatsAppTextOnly}
              title="Enviar apenas o resumo em texto"
            >
              💬 Apenas Texto
            </button>
          </div>

          {statusFeedback && (
            <div className={s.shareStatusToast}>{statusFeedback}</div>
          )}

          {isHost && (
            <button className={s.secondaryBtn} onClick={handleReopen}>
              🔄 Reabrir Mesa (Continuar Comendo)
            </button>
          )}

          <button className={s.leaveBtn} onClick={onLeaveRoom}>
            🚪 Sair da Sala
          </button>
        </div>

        {/* ── TEMPLATES OFFSCREEN PARA CAPTURA DAS DUAS IMAGENS ── */}
        <ShareCards
          ref={cardsRef}
          room={room}
          ranking={ranking}
          summary={summary}
          awards={awards}
        />
      </div>
    </div>
  )
}
