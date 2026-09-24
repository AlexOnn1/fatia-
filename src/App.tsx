import { useState, useEffect } from 'react'
import {
  FaGithub,
  FaLinkedinIn,
  FaInstagram,
  FaEnvelope,
  FaWhatsapp,
  FaGlobe,
  FaMapMarkerAlt,
} from 'react-icons/fa'
import type { Room, SocialLink } from './types'
import {
  subscribeToRoom,
  getSavedParticipant,
  clearParticipantSession,
} from './services/roomService'
import { BrandProvider, useBrand } from './context/BrandContext'
import { SoloMode } from './components/SoloMode'
import { RoomLobby } from './components/RoomLobby'
import { RoomLive } from './components/RoomLive'
import { BackgroundFallingItems } from './components/BackgroundFallingItems'
import { useWakeLock } from './utils/wakeLock'
import s from './App.module.css'

function renderSocialIcon(link: SocialLink) {
  switch (link.type) {
    case 'github':
      return <FaGithub />
    case 'linkedin':
      return <FaLinkedinIn />
    case 'instagram':
      return <FaInstagram />
    case 'whatsapp':
      return <FaWhatsapp />
    case 'website':
      return <FaGlobe />
    case 'maps':
      return <FaMapMarkerAlt />
    case 'email':
    default:
      return <FaEnvelope />
  }
}

function getSocialHoverColor(type: SocialLink['type']) {
  switch (type) {
    case 'github':
      return '#f0f0f0'
    case 'linkedin':
      return '#0A66C2'
    case 'instagram':
      return '#E1306C'
    case 'whatsapp':
      return '#25D366'
    case 'maps':
      return '#EA4335'
    case 'website':
      return '#FFD166'
    case 'email':
    default:
      return '#E63946'
  }
}

function AppContent() {
  const {
    brand,
    userFinancialStatus,
    cascadeTotalFatias,
    cascadeGroupSize,
    setCascadeTotalFatias,
    setCascadeGroupSize,
  } = useBrand()
  const { isSupported: isWakeSupported, isActive: isWakeActive, toggleWakeLock } = useWakeLock()
  const [appMode, setAppMode] = useState<'solo' | 'room'>('solo')
  const [activeRoom, setActiveRoom] = useState<Room | null>(null)
  const [currentParticipantId, setCurrentParticipantId] = useState<string | null>(null)
  const [urlRoomCode, setUrlRoomCode] = useState<string>('')

  const dollarStatusClass =
    userFinancialStatus === 'lucro'
      ? s.dollarGreen
      : userFinancialStatus === 'prejuizo'
      ? s.dollarRed
      : ''

  // 1. Detectar parâmetro ?sala=XYZ na URL ou sessão salva
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const salaParam = params.get('sala')

    if (salaParam) {
      setUrlRoomCode(salaParam.toUpperCase())
      setAppMode('room')
    } else {
      // Verificar sessão anterior no localStorage
      const saved = getSavedParticipant()
      if (saved) {
        setAppMode('room')
        setCurrentParticipantId(saved.participantId)
        // Tentativa de carregar a sala salva
        const unsubscribe = subscribeToRoom(saved.roomCode, room => {
          if (room && room.participants?.[saved.participantId]) {
            setActiveRoom(room)
          } else {
            clearParticipantSession()
            setActiveRoom(null)
          }
        })
        return () => unsubscribe()
      }
    }
  }, [])

  // 2. Se estiver numa sala ativa, manter sincronização em tempo real
  useEffect(() => {
    if (!activeRoom?.code) return

    const unsubscribe = subscribeToRoom(activeRoom.code, updatedRoom => {
      if (updatedRoom) {
        setActiveRoom(updatedRoom)
      } else {
        // Sala foi deletada ou não existe
        setActiveRoom(null)
        clearParticipantSession()
      }
    })

    return () => unsubscribe()
  }, [activeRoom?.code])

  const handleRoomEntered = (room: Room, participantId: string) => {
    setActiveRoom(room)
    setCurrentParticipantId(participantId)
    const newUrl = `${window.location.pathname}?sala=${room.code}`
    window.history.replaceState(null, '', newUrl)
  }

  const handleLeaveRoom = () => {
    clearParticipantSession()
    setActiveRoom(null)
    setCurrentParticipantId(null)
    setCascadeTotalFatias(0)
    setCascadeGroupSize(1)
    const newUrl = window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }

  const handleModeChange = (mode: 'solo' | 'room') => {
    setAppMode(mode)
    if (mode === 'room' && !activeRoom) {
      setCascadeTotalFatias(0)
      setCascadeGroupSize(1)
    }
    if (mode === 'solo' && !activeRoom) {
      const newUrl = window.location.pathname
      window.history.replaceState(null, '', newUrl)
    }
  }

  return (
    <>
      <BackgroundFallingItems
        totalFatias={cascadeTotalFatias}
        groupSize={cascadeGroupSize}
      />
      <div className={s.root}>
      {/* ── HEADER ── */}
      <header className={s.header}>
        <div className={s.logoLockup}>
          {brand.logoImageUrl ? (
            <img src={brand.logoImageUrl} alt={brand.appName} className={s.logoImg} />
          ) : (
            <span className={s.logoEmoji} aria-hidden>
              {brand.logoEmoji}
            </span>
          )}
          <div className={s.logoText}>
            <h1 className={s.wordmark}>
              {brand.appName.endsWith('$') ? (
                <>
                  {brand.appName.slice(0, -1)}
                  <span
                    className={`${s.dollar} ${dollarStatusClass}`}
                    title={
                      userFinancialStatus === 'lucro'
                        ? 'Lucro no Rodízio! 😎'
                        : userFinancialStatus === 'prejuizo'
                        ? 'No Prejuízo (coma mais!) 🍕'
                        : 'Zero a zero / Inicial'
                    }
                  >
                    $
                  </span>
                </>
              ) : (
                brand.appName
              )}
            </h1>
            <p className={s.tagline}>{brand.tagline}</p>
          </div>
        </div>
        <p className={s.slogan}>{brand.slogan}</p>

        {/* ── BOTÃO WAKE LOCK (TELA SEMPRE ATIVA NO MOBILE) ── */}
        {isWakeSupported && (
          <div style={{ marginTop: '8px', marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              className={`${s.wakeLockToggle} ${isWakeActive ? s.wakeLockActive : ''}`}
              onClick={toggleWakeLock}
              title={
                isWakeActive
                  ? 'A tela do celular permanecerá ligada enquanto você come. Toque para desativar.'
                  : 'Toque para evitar que a tela do celular apague enquanto você come.'
              }
            >
              <span className={s.wakeLockIcon}>{isWakeActive ? '💡' : '💤'}</span>
              <span className={s.wakeLockText}>
                {isWakeActive ? 'Tela Sempre Ativa' : 'Manter Tela Ativa'}
              </span>
              <span className={`${s.wakeLockStatusDot} ${isWakeActive ? s.wakeLockDotActive : ''}`} />
            </button>
          </div>
        )}

        {/* ── SELETOR DE MODO: SOLO vs MODO GALERA ── */}
        <div className={s.modeSelector}>
          <button
            type="button"
            className={`${s.modeBtn} ${appMode === 'solo' ? s.modeBtnActive : ''}`}
            onClick={() => handleModeChange('solo')}
          >
            {brand.item.emoji} Modo Solo
          </button>
          <button
            type="button"
            className={`${s.modeBtn} ${appMode === 'room' ? s.modeBtnActive : ''}`}
            onClick={() => handleModeChange('room')}
          >
            🏆 Modo Galera (Sala Online)
            {activeRoom && <span className={s.activeDot} />}
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className={s.main}>
        {appMode === 'solo' ? (
          <SoloMode />
        ) : activeRoom && currentParticipantId ? (
          <RoomLive
            room={activeRoom}
            currentParticipantId={currentParticipantId}
            onLeaveRoom={handleLeaveRoom}
          />
        ) : (
          <RoomLobby initialCode={urlRoomCode} onRoomEntered={handleRoomEntered} />
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className={s.footer}>
        <div className={s.footerQuote}>
          <p className={s.quote}>{brand.footer.quote}</p>
        </div>
        <p className={s.footerRef}>{brand.item.referenceNote}</p>

        <div className={s.footerBar}>
          {brand.footer.socialLinks && brand.footer.socialLinks.length > 0 && (
            <div className={s.footerSocials}>
              {brand.footer.socialLinks.map((link, idx) => (
                <a
                  key={idx}
                  className={s.footerSocialLink}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label || link.type}
                  title={link.label || link.type}
                  style={
                    {
                      '--social-hover': getSocialHoverColor(link.type),
                    } as React.CSSProperties
                  }
                >
                  {renderSocialIcon(link)}
                </a>
              ))}
            </div>
          )}

          <div className={s.footerCopy}>
            <p className={s.footerCopyText}>
              © 2026{' '}
              <a
                href="https://alexon.dev"
                target="_blank"
                rel="noopener noreferrer"
                className={s.devBrandLink}
                title="Portfólio de alexon.dev"
              >
                alexon.dev
              </a>
              {brand.footer.establishmentName !== 'Fatia$' && (
                <> • {brand.footer.establishmentName}</>
              )}
              . Todos os direitos reservados.
            </p>
            <p className={s.footerStack}>
              Desenvolvido com <span>React</span> + <span>TypeScript</span> por{' '}
              <a
                href="https://alexon.dev"
                target="_blank"
                rel="noopener noreferrer"
                className={s.devBrandLink}
                title="Conheça alexon.dev"
              >
                alexon.dev 🚀
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}

export default function App() {
  return (
    <BrandProvider>
      <AppContent />
    </BrandProvider>
  )
}
