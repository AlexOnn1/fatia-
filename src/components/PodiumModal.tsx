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
import { useBrand } from '../context/BrandContext'
import {
  playBronzeReveal,
  playSilverReveal,
  playSuspenseDrumRoll,
  playChampionReveal,
  triggerHaptic,
  isSoundMuted,
  toggleSound,
} from '../services/soundEffects'
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
  const { brand, formatUnits } = useBrand()
  const [generatingImages, setGeneratingImages] = useState(false)
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null)
  const awards: PodiumAward[] = calculateAwards(room, brand)

  // Estados para animação de revelação estilo Kahoot
  // 0: Suspense inicial
  // 1: Revela 3º lugar
  // 2: Revela 2º lugar
  // 3: Suspense para o 1º lugar
  // 4: Revela 1º lugar (coroa + explosão)
  // 5: Revelação concluída (mostra prêmios, balanço e botões)
  const [revealStep, setRevealStep] = useState<number>(0)
  const [isRevealing, setIsRevealing] = useState<boolean>(true)
  const [soundMuted, setSoundMuted] = useState<boolean>(isSoundMuted())
  const [isRumbling, setIsRumbling] = useState<boolean>(false)

  const top1 = ranking[0]
  const top2 = ranking[1]
  const top3 = ranking[2]

  const triggerRumble = () => {
    setIsRumbling(true)
    setTimeout(() => setIsRumbling(false), 360)
  }

  const handleToggleSound = () => {
    const newMuted = toggleSound()
    setSoundMuted(newMuted)
  }

  const skipAnimation = () => {
    setRevealStep(5)
    setIsRevealing(false)
  }

  const replayAnimation = () => {
    setRevealStep(0)
    setIsRevealing(true)
  }

  // Disparo de confetes temáticos de cada etapa
  const fireConfetti = (type: 'bronze' | 'silver' | 'gold') => {
    try {
      if (type === 'bronze') {
        confetti({
          particleCount: 55,
          angle: 60,
          spread: 60,
          origin: { x: 0.75, y: 0.7 },
          colors: ['#E8A87C', '#C38D64', '#FFD166'],
        })
      } else if (type === 'silver') {
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 60,
          origin: { x: 0.25, y: 0.65 },
          colors: ['#E0E0E0', '#BDBDBD', '#4A90E2', '#FFFFFF'],
        })
      } else if (type === 'gold') {
        // Explosão central maciça de vitória
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { x: 0.5, y: 0.55 },
          colors: ['#FFD166', '#FF6B6B', '#06D6A0', '#F4A261', '#E76F51', '#FFB703'],
        })

        // Tenta soltar emojis voadores se OffscreenCanvas estiver disponível
        try {
          if (typeof confetti.shapeFromText === 'function') {
            const pizzaShape = confetti.shapeFromText({ text: '🍕', scalar: 2 })
            const crownShape = confetti.shapeFromText({ text: '👑', scalar: 2 })
            const starShape = confetti.shapeFromText({ text: '⭐', scalar: 2 })
            confetti({
              shapes: [pizzaShape, crownShape, starShape],
              particleCount: 25,
              spread: 85,
              origin: { x: 0.5, y: 0.5 },
              scalar: 2,
            })
          }
        } catch {
          // ignore
        }

        // Canhões cruzados laterais logo após o impacto
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 75,
            origin: { x: 0.1, y: 0.6 },
            colors: ['#FFD166', '#FF6B6B', '#F4A261'],
          })
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 75,
            origin: { x: 0.9, y: 0.6 },
            colors: ['#FFD166', '#06D6A0', '#FFB703'],
          })
        }, 320)
      }
    } catch {
      // ignore
    }
  }

  // Sequenciador automático da revelação estilo Kahoot
  useEffect(() => {
    if (!isRevealing) return

    if (!ranking || ranking.length === 0) {
      setRevealStep(5)
      setIsRevealing(false)
      return
    }

    const timers: ReturnType<typeof setTimeout>[] = []
    const has3 = ranking.length >= 3 && !!top3
    const has2 = ranking.length >= 2 && !!top2
    const has1 = ranking.length >= 1 && !!top1

    let currentTime = 900

    // 1. Revelar 3º lugar (Bronze)
    if (has3) {
      timers.push(
        setTimeout(() => {
          setRevealStep(1)
          playBronzeReveal()
          triggerHaptic([60, 40])
          triggerRumble()
          fireConfetti('bronze')
        }, currentTime)
      )
      currentTime += 1800
    }

    // 2. Revelar 2º lugar (Prata)
    if (has2) {
      timers.push(
        setTimeout(() => {
          setRevealStep(2)
          playSilverReveal()
          triggerHaptic([80, 50, 80])
          triggerRumble()
          fireConfetti('silver')
        }, currentTime)
      )
      currentTime += 1800
    }

    // 3. Suspense dramático para o Campeão com Rufar Autêntico de Tambores
    if (has1) {
      timers.push(
        setTimeout(() => {
          setRevealStep(3)
          playSuspenseDrumRoll()
          // Padrão de vibração tátil sincronizado com as baquetas rufando no tambor
          triggerHaptic([
            50, 150, 50, 130, 40, 110, 40, 90, 35, 75, 30, 60, 25, 45, 25, 35,
            20, 25, 20, 25, 20, 25, 20, 25, 20, 25, 120,
          ])
        }, currentTime)
      )
      currentTime += 2350 // Duração perfeita para o rufar crescer, estalar o rimshot e criar o silêncio de ouro

      // 4. Revelação do 1º lugar (Ouro)
      timers.push(
        setTimeout(() => {
          setRevealStep(4)
          playChampionReveal()
          triggerHaptic([120, 60, 120, 60, 250, 100, 300])
          triggerRumble()
          fireConfetti('gold')
        }, currentTime)
      )
      currentTime += 2400
    }

    // 5. Finalizar sequência e liberar restante da tela
    timers.push(
      setTimeout(() => {
        setRevealStep(5)
        setIsRevealing(false)
      }, currentTime)
    )

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [isRevealing, ranking.length, top1, top2, top3])

  const cardsRef = useRef<{
    podiumRef: HTMLDivElement | null
    rankingRef: HTMLDivElement | null
  }>({
    podiumRef: null,
    rankingRef: null,
  })

  const [cachedImages, setCachedImages] = useState<{
    podiumBlob: Blob
    rankingBlob: Blob
    podiumFile: File
    rankingFile: File
    cleanTitle: string
  } | null>(null)

  // Função auxiliar para gerar blobs e arquivos de imagem em alta definição
  const generateImagesAsync = async () => {
    const { podiumRef, rankingRef } = cardsRef.current
    if (!podiumRef || !rankingRef) return null

    try {
      await document.fonts?.ready
    } catch {
      // ignore
    }

    const podiumBlob = await toBlob(podiumRef, { quality: 0.95, pixelRatio: 2 })
    const rankingBlob = await toBlob(rankingRef, { quality: 0.95, pixelRatio: 2 })
    if (!podiumBlob || !rankingBlob) return null

    const cleanTitle = (room.name || room.code).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
    const podiumFile = new File([podiumBlob], `${brand.slug}_${cleanTitle}_podio.png`, {
      type: 'image/png',
    })
    const rankingFile = new File([rankingBlob], `${brand.slug}_${cleanTitle}_ranking.png`, {
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
    saveBlobToDownloads(pBlob, `${brand.slug}_${prefix}_podio.png`)
    setTimeout(() => {
      saveBlobToDownloads(rBlob, `${brand.slug}_${prefix}_ranking.png`)
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
    const text = generateWhatsAppShareText(room, ranking, summary, brand)
    navigator.clipboard?.writeText(text)
    setStatusFeedback('Texto copiado! Abrindo WhatsApp...')

    setTimeout(() => {
      openWhatsAppUrl(text)
    }, 400)
  }

  // Compartilhar com imagens (Salva em Downloads e engatilha no WhatsApp)
  const handleShareWithImages = async () => {
    setGeneratingImages(true)
    setStatusFeedback(`Salvando 2 imagens e abrindo WhatsApp... ${brand.item.emoji}`)

    try {
      let images = cachedImages
      if (!images) {
        images = await generateImagesAsync()
      }

      if (!images) {
        throw new Error('Falha ao renderizar imagens do pódio e ranking.')
      }

      const { podiumBlob, rankingBlob, podiumFile, rankingFile, cleanTitle } = images
      const text = generateWhatsAppShareText(room, ranking, summary, brand)

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

  const getBannerContent = () => {
    if (revealStep === 0) {
      return {
        text: '🥁 E os grandes devoradores da mesa são...',
        isGold: false,
      }
    }
    if (revealStep === 1) {
      return {
        text: `🥉 3º Lugar: ${top3?.name || ''} subiu ao pódio!`,
        isGold: false,
      }
    }
    if (revealStep === 2) {
      return {
        text: `🥈 2º Lugar: ${top2?.name || ''} garantiu a prata!`,
        isGold: false,
      }
    }
    if (revealStep === 3) {
      return {
        text: '🥁 RUFEM OS TAMBORES... QUEM É O GRANDE CAMPEÃO?! 🥁',
        isGold: true,
        isDrum: true,
      }
    }
    if (revealStep === 4) {
      return {
        text: `🏆 1º LUGAR: ${top1?.name || ''} É O MAIOR DEVORADOR! 🏆`,
        isGold: true,
        isDrum: false,
      }
    }
    return null
  }

  const banner = getBannerContent()

  // Posição horizontal do holofote de acordo com a etapa ativa
  const getSpotlightStyle = () => {
    if (revealStep === 1) return { left: '80%', opacity: 1 }
    if (revealStep === 2) return { left: '20%', opacity: 1 }
    if (revealStep === 3) return { left: '50%', opacity: 1, width: '180px' }
    if (revealStep === 4) return { left: '50%', opacity: 1, width: '220px' }
    return { left: '50%', opacity: 0 }
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

          {/* Banner dinâmico estilo Kahoot */}
          {banner && (
            <div
              className={`${s.kahootBanner} ${
                banner.isDrum
                  ? s.kahootBannerDrum
                  : banner.isGold
                  ? s.kahootBannerGold
                  : ''
              }`}
            >
              <span>{banner.text}</span>
            </div>
          )}

          {/* Barra de Controles (Som, Pular e Rever) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px',
              flexWrap: 'wrap',
            }}
          >
            <button
              className={s.soundToggleBtn}
              onClick={handleToggleSound}
              title={soundMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar Sons'}
            >
              {soundMuted ? '🔇 Som Desativado' : '🔊 Som Ativo'}
            </button>

            {isRevealing && (
              <button
                className={s.skipAnimBtn}
                onClick={skipAnimation}
                title="Pular animação e ver resultado completo"
                style={{ marginTop: 0 }}
              >
                ⏩ Pular Revelação
              </button>
            )}

            {revealStep === 5 && (
              <button
                className={s.replayAnimBtn}
                onClick={replayAnimation}
                title="Rever a animação dramática do pódio"
                style={{ margin: 0 }}
              >
                🔁 Rever Revelação
              </button>
            )}
          </div>
        </div>

        {/* ── PÓDIO VISUAL (1º, 2º e 3º) COM ANIMAÇÃO KAHOOT ── */}
        <div className={`${s.podiumStage} ${isRumbling ? s.stageRumbling : ''}`}>
          {/* Holofote Dinâmico de Palco */}
          {isRevealing && <div className={s.spotlightBeam} style={getSpotlightStyle()} />}

          {/* 2º Lugar (Prata) */}
          <div
            className={`${s.podiumCol} ${s.podiumCol2} ${
              revealStep >= 2 ? s.podiumColRevealed : s.podiumColHidden
            }`}
          >
            {revealStep < 2 ? (
              <div className={s.mysteryPlaceholder}>
                <div className={s.mysteryBox}>❓</div>
              </div>
            ) : top2 ? (
              <>
                <AvatarImg
                  avatarId={top2.emoji}
                  className={`${s.podiumAvatarImg} ${s.podiumAvatarPop}`}
                />
                <span className={s.podiumName}>{top2.name}</span>
                <span className={s.podiumScore}>{formatUnits(top2.fatias)}</span>
                <div className={`${s.podiumPedestal} ${s.pedestal2}`}>
                  <span className={s.podiumRankNum}>2</span>
                </div>
              </>
            ) : (
              <div className={s.podiumEmpty} />
            )}
          </div>

          {/* 1º Lugar (Ouro / Grande Campeão) */}
          <div
            className={`${s.podiumCol} ${s.podiumCol1} ${
              revealStep >= 4 ? s.podiumColRevealed : s.podiumColHidden
            }`}
          >
            {revealStep < 4 ? (
              <div className={s.mysteryPlaceholder}>
                <div
                  className={`${s.mysteryBox} ${
                    revealStep === 3 ? s.drumBoxVibrating : ''
                  }`}
                  style={{
                    borderColor: revealStep === 3 ? '#FFD166' : 'var(--yellow)',
                    background:
                      revealStep === 3
                        ? 'rgba(255, 209, 102, 0.35)'
                        : 'rgba(255, 209, 102, 0.15)',
                    fontSize: revealStep === 3 ? '32px' : '26px',
                  }}
                >
                  {revealStep === 3 ? '🥁' : '👑'}
                </div>
              </div>
            ) : top1 ? (
              <>
                <div className={s.sunburstRays} />
                <span className={s.sparkleFloat1}>✨</span>
                <span className={s.sparkleFloat2}>⭐</span>
                <span className={`${s.podiumCrown} ${s.podiumCrownDrop}`}>👑</span>
                <AvatarImg
                  avatarId={top1.emoji}
                  className={`${s.podiumAvatarImg} ${s.avatarGoldImg} ${s.podiumAvatarPop} ${s.avatarGoldGlow}`}
                />
                <span className={`${s.podiumName} ${s.nameGold}`}>{top1.name}</span>
                <span className={s.podiumScoreBold}>{formatUnits(top1.fatias)}</span>
                <div className={`${s.podiumPedestal} ${s.pedestal1}`}>
                  <span className={s.podiumRankNum}>1</span>
                </div>
              </>
            ) : null}
          </div>

          {/* 3º Lugar (Bronze) */}
          <div
            className={`${s.podiumCol} ${s.podiumCol3} ${
              revealStep >= 1 ? s.podiumColRevealed : s.podiumColHidden
            }`}
          >
            {revealStep < 1 ? (
              <div className={s.mysteryPlaceholder}>
                <div className={s.mysteryBox}>❓</div>
              </div>
            ) : top3 ? (
              <>
                <AvatarImg
                  avatarId={top3.emoji}
                  className={`${s.podiumAvatarImg} ${s.podiumAvatarPop}`}
                />
                <span className={s.podiumName}>{top3.name}</span>
                <span className={s.podiumScore}>{formatUnits(top3.fatias)}</span>
                <div className={`${s.podiumPedestal} ${s.pedestal3}`}>
                  <span className={s.podiumRankNum}>3</span>
                </div>
              </>
            ) : (
              <div className={s.podiumEmpty} />
            )}
          </div>
        </div>

        {/* ── SEÇÕES FINAIS (FADE-IN REVELADAS NA ETAPA 5) ── */}
        {revealStep === 5 && (
          <div
            className={s.revealedSection}
            style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
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
                          <strong className={s.awardRecipientName}>
                            {aw.recipientName}
                          </strong>
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
                  <span className={s.podiumSummaryLabel}>
                    {brand.item.plural.charAt(0).toUpperCase() +
                      brand.item.plural.slice(1)}{' '}
                    Devorad{brand.item.unitGender === 'o' ? 'os' : 'as'}
                  </span>
                  <span className={s.podiumSummaryVal}>
                    {summary.totalFatias} {brand.item.emoji}
                  </span>
                </div>
                <div className={s.podiumSummaryItem}>
                  <span className={s.podiumSummaryLabel}>Média por Pessoa</span>
                  <span className={s.podiumSummaryVal}>
                    {formatUnits(summary.mediaFatias)}
                  </span>
                </div>
                <div className={s.podiumSummaryItem}>
                  <span className={s.podiumSummaryLabel}>Valor Consumido</span>
                  <span className={s.podiumSummaryVal}>
                    {formatBRL(summary.totalConsumido)}
                  </span>
                </div>
                <div className={s.podiumSummaryItem}>
                  <span className={s.podiumSummaryLabel}>
                    {summary.lucroMesa >= 0
                      ? `Prejuízo n${
                          brand.establishmentType === 'pizzaria'
                            ? 'a Pizzaria'
                            : 'o Restaurante'
                        }`
                      : `Lucro d${
                          brand.establishmentType === 'pizzaria'
                            ? 'a Pizzaria'
                            : 'o Restaurante'
                        }`}
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

              <p className={s.podiumDevFooter}>
                Desenvolvido por{' '}
                <a
                  href="https://alexon.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.podiumDevLink}
                >
                  alexon.dev 🚀
                </a>
              </p>
            </div>
          </div>
        )}

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
