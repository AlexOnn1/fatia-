import { useState, useEffect } from 'react'
import { createRoom, joinRoom } from '../services/roomService'
import { isFirebaseConfigured } from '../services/firebase'
import { FirebaseModal } from './FirebaseModal'
import type { Room } from '../types'
import s from '../App.module.css'

const EMOJIS = ['🍕', '👑', '🦁', '🦖', '🥷', '🚀', '🐷', '🥊', '🦊', '⚡', '🧀', '🌮']

interface RoomLobbyProps {
  initialCode?: string
  onRoomEntered: (room: Room, participantId: string) => void
}

export function RoomLobby({ initialCode = '', onRoomEntered }: RoomLobbyProps) {
  const [tab, setTab] = useState<'create' | 'join'>(initialCode ? 'join' : 'create')
  const [showFirebaseModal, setShowFirebaseModal] = useState(false)

  // Create room state
  const [createName, setCreateName] = useState('')
  const [createHostName, setCreateHostName] = useState('')
  const [createValor, setCreateValor] = useState('69.90')
  const [createEmoji, setCreateEmoji] = useState('🍕')

  // Join room state
  const [joinCode, setJoinCode] = useState(initialCode.replace(/\s+/g, '').toUpperCase())
  const [joinParticipantName, setJoinParticipantName] = useState('')
  const [joinEmoji, setJoinEmoji] = useState('🦁')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialCode) {
      setJoinCode(initialCode.replace(/\s+/g, '').toUpperCase())
      setTab('join')
    }
  }, [initialCode])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const parsedValor = parseFloat(createValor.replace(',', '.'))
      const { room, participantId } = await createRoom({
        hostName: createHostName.trim() || 'Líder do Rodízio',
        emoji: createEmoji,
        roomName: createName.trim() || 'Rodízio da Galera',
        valorRodizio: isNaN(parsedValor) || parsedValor <= 0 ? 69.9 : parsedValor,
      })
      onRoomEntered(room, participantId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar sala.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = joinCode.replace(/\s+/g, '').toUpperCase()
    if (!cleanCode) {
      setError('Por favor, informe o código da sala.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const { room, participantId } = await joinRoom({
        roomCode: cleanCode,
        participantName: joinParticipantName.trim() || 'Convidado Fominha',
        emoji: joinEmoji,
      })
      onRoomEntered(room, participantId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao entrar na sala.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.lobbyContainer}>
      {/* ── STATUS DE CONEXÃO & CONFIGURAÇÃO FIREBASE ── */}
      <div className={s.connectionBar}>
        <div className={s.connectionStatusInfo}>
          {isFirebaseConfigured ? (
            <span className={s.connOnlineTag}>
              🟢 <strong>Online na Nuvem</strong> (Celulares conectados)
            </span>
          ) : (
            <span className={s.connOfflineTag}>
              🟡 <strong>Modo Local</strong> (Mesmo navegador)
            </span>
          )}
        </div>
        <button
          type="button"
          className={s.configFirebaseBtn}
          onClick={() => setShowFirebaseModal(true)}
          title="Configurar Firebase para conectar múltiplos celulares"
        >
          ⚙️ {isFirebaseConfigured ? 'Firebase Ativo' : 'Conectar Celulares'}
        </button>
      </div>

      <div className={s.lobbyTabs}>
        <button
          type="button"
          className={`${s.lobbyTabBtn} ${tab === 'create' ? s.lobbyTabActive : ''}`}
          onClick={() => {
            setTab('create')
            setError(null)
          }}
        >
          🚀 Criar Nova Sala
        </button>
        <button
          type="button"
          className={`${s.lobbyTabBtn} ${tab === 'join' ? s.lobbyTabActive : ''}`}
          onClick={() => {
            setTab('join')
            setError(null)
          }}
        >
          🔑 Entrar com Código
        </button>
      </div>

      {error && (
        <div className={s.lobbyError}>
          <p>⚠️ {error}</p>
          {!isFirebaseConfigured && (
            <button
              type="button"
              className={s.errorActionBtn}
              onClick={() => setShowFirebaseModal(true)}
            >
              Configurar Firebase agora ⚙️
            </button>
          )}
        </div>
      )}

      {tab === 'create' ? (
        <form className={s.card} onSubmit={handleCreate}>
          <h2 className={s.lobbyTitle}>Criar Mesa de Competição</h2>
          <p className={s.lobbySubtitle}>
            Crie uma sala e convide seus amigos da mesa para disputar quem come mais!
          </p>

          <div className={s.formGroup}>
            <label className={s.label}>Nome da Mesa / Rodízio</label>
            <input
              type="text"
              className={s.textInput}
              placeholder="Ex: Rodízio da Sexta"
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              maxLength={30}
            />
          </div>

          <div className={s.formGroup}>
            <label className={s.label}>Valor do Rodízio por pessoa (R$)</label>
            <div className={s.inputWrap}>
              <span className={s.inputPrefix}>R$</span>
              <input
                type="number"
                step="0.01"
                className={s.input}
                placeholder="69,90"
                value={createValor}
                onChange={e => setCreateValor(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <div className={s.formGroup}>
            <label className={s.label}>Seu Apelido</label>
            <input
              type="text"
              className={s.textInput}
              placeholder="Ex: Alex Devorador"
              value={createHostName}
              onChange={e => setCreateHostName(e.target.value)}
              maxLength={20}
              required
            />
          </div>

          <div className={s.formGroup}>
            <label className={s.label}>Escolha seu Avatar</label>
            <div className={s.emojiGrid}>
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className={`${s.emojiBtn} ${createEmoji === emoji ? s.emojiActive : ''}`}
                  onClick={() => setCreateEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className={s.primaryBtn} disabled={loading}>
            {loading ? 'Criando Sala...' : '🚀 Criar Sala e Jogar'}
          </button>
        </form>
      ) : (
        <form className={s.card} onSubmit={handleJoin}>
          <h2 className={s.lobbyTitle}>Entrar na Mesa</h2>
          <p className={s.lobbySubtitle}>
            Digite o código de 5 caracteres que o anfitrião da sua mesa compartilhou.
          </p>

          <div className={s.formGroup}>
            <label className={s.label}>Código da Sala</label>
            <input
              type="text"
              className={`${s.textInput} ${s.codeInput}`}
              placeholder="Ex: PIZZA"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.replace(/\s+/g, '').toUpperCase())}
              maxLength={6}
              autoFocus
              required
            />
          </div>

          <div className={s.formGroup}>
            <label className={s.label}>Seu Apelido</label>
            <input
              type="text"
              className={s.textInput}
              placeholder="Ex: Bia da Pizza"
              value={joinParticipantName}
              onChange={e => setJoinParticipantName(e.target.value)}
              maxLength={20}
              required
            />
          </div>

          <div className={s.formGroup}>
            <label className={s.label}>Escolha seu Avatar</label>
            <div className={s.emojiGrid}>
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className={`${s.emojiBtn} ${joinEmoji === emoji ? s.emojiActive : ''}`}
                  onClick={() => setJoinEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className={s.primaryBtn} disabled={loading}>
            {loading ? 'Conectando à Mesa...' : '🍕 Entrar no Rodízio'}
          </button>
        </form>
      )}

      {showFirebaseModal && <FirebaseModal onClose={() => setShowFirebaseModal(false)} />}
    </div>
  )
}
