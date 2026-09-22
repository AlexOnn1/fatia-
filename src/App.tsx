import { useState, useEffect } from 'react'
import { FaGithub, FaLinkedinIn, FaInstagram, FaEnvelope } from 'react-icons/fa'
import type { Room } from './types'
import { formatBRL, PRECO_FATIA_REFERENCIA } from './utils'
import {
  subscribeToRoom,
  getSavedParticipant,
  clearParticipantSession,
} from './services/roomService'
import { SoloMode } from './components/SoloMode'
import { RoomLobby } from './components/RoomLobby'
import { RoomLive } from './components/RoomLive'
import s from './App.module.css'

export default function App() {
  const [appMode, setAppMode] = useState<'solo' | 'room'>('solo')
  const [activeRoom, setActiveRoom] = useState<Room | null>(null)
  const [currentParticipantId, setCurrentParticipantId] = useState<string | null>(null)
  const [urlRoomCode, setUrlRoomCode] = useState<string>('')

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
    // Atualizar URL sem recarregar a página
    const newUrl = `${window.location.pathname}?sala=${room.code}`
    window.history.replaceState(null, '', newUrl)
  }

  const handleLeaveRoom = () => {
    clearParticipantSession()
    setActiveRoom(null)
    setCurrentParticipantId(null)
    const newUrl = window.location.pathname
    window.history.replaceState(null, '', newUrl)
  }

  const handleModeChange = (mode: 'solo' | 'room') => {
    setAppMode(mode)
    if (mode === 'solo' && !activeRoom) {
      const newUrl = window.location.pathname
      window.history.replaceState(null, '', newUrl)
    }
  }

  return (
    <div className={s.root}>
      {/* ── HEADER ── */}
      <header className={s.header}>
        <div className={s.logoLockup}>
          <span className={s.logoEmoji} aria-hidden>
            🍕
          </span>
          <div className={s.logoText}>
            <h1 className={s.wordmark}>
              Fatia<span className={s.dollar}>$</span>
            </h1>
            <p className={s.tagline}>★ Contador Oficial de Rodízio ★</p>
          </div>
        </div>
        <p className={s.slogan}>Coma mais. Calcule tudo. Lucro sempre que der.</p>

        {/* ── SELETOR DE MODO: SOLO vs MODO GALERA ── */}
        <div className={s.modeSelector}>
          <button
            type="button"
            className={`${s.modeBtn} ${appMode === 'solo' ? s.modeBtnActive : ''}`}
            onClick={() => handleModeChange('solo')}
          >
            🍕 Modo Solo
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
          <p className={s.quote}>"Não é exagero se for no rodízio."</p>
        </div>
        <p className={s.footerRef}>
          Ref.: fatia avulsa a {formatBRL(PRECO_FATIA_REFERENCIA)} — mercado BR 2026
        </p>

        <div className={s.footerBar}>
          <div className={s.footerSocials}>
            <a
              className={s.footerSocialLink}
              href="https://github.com/AlexOnn1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
              style={{ '--social-hover': '#f0f0f0' } as React.CSSProperties}
            >
              <FaGithub />
            </a>
            <a
              className={s.footerSocialLink}
              href="https://www.linkedin.com/in/alexsander-albino-dev/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              style={{ '--social-hover': '#0A66C2' } as React.CSSProperties}
            >
              <FaLinkedinIn />
            </a>
            <a
              className={s.footerSocialLink}
              href="https://www.instagram.com/alexon_dev/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
              style={{ '--social-hover': '#E1306C' } as React.CSSProperties}
            >
              <FaInstagram />
            </a>
            <a
              className={s.footerSocialLink}
              href="mailto:alexsander.santos.contato@gmail.com"
              aria-label="Email"
              title="Email"
              style={{ '--social-hover': '#E63946' } as React.CSSProperties}
            >
              <FaEnvelope />
            </a>
          </div>

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
