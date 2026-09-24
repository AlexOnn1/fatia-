import { useState, useEffect, useCallback, useRef } from 'react'
import {
  sendRoomReaction,
  subscribeToRoomReactions,
  type LiveReaction,
} from '../services/roomService'
import { triggerHaptic } from '../utils/haptics'
import s from '../App.module.css'

interface FloatingItem {
  id: string
  emoji: string
  senderName: string
  left: number // percent 20 - 85%
  scale: number // 0.8 - 1.4
  duration: number // 2.2s - 3.2s
}

const REACTION_EMOJIS = ['🍻', '🔥', '😱', '🤢', '👑', '🍕']

interface LiveReactionsProps {
  roomCode: string
  senderName: string
  isFinished?: boolean
}

export function LiveReactions({ roomCode, senderName, isFinished }: LiveReactionsProps) {
  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([])
  const lastSentRef = useRef<number>(0)

  // Escuta novas reações da sala (locais e via Firebase)
  useEffect(() => {
    const unsub = subscribeToRoomReactions(roomCode, (reaction: LiveReaction) => {
      const newItem: FloatingItem = {
        id: reaction.id,
        emoji: reaction.emoji,
        senderName: reaction.senderName,
        left: 20 + Math.random() * 65, // entre 20% e 85% da largura
        scale: 0.85 + Math.random() * 0.5,
        duration: 2.2 + Math.random() * 0.8,
      }

      setFloatingItems(prev => [...prev.slice(-15), newItem])

      // Auto-limpeza após término da animação
      setTimeout(() => {
        setFloatingItems(prev => prev.filter(item => item.id !== newItem.id))
      }, (newItem.duration + 0.3) * 1000)
    })

    return () => unsub()
  }, [roomCode])

  const handleSendEmoji = useCallback(
    async (emoji: string) => {
      const now = Date.now()
      // Cooldown de 180ms para evitar flood
      if (now - lastSentRef.current < 180) return
      lastSentRef.current = now

      triggerHaptic('light')
      await sendRoomReaction(roomCode, emoji, senderName || 'Amigo')
    },
    [roomCode, senderName]
  )

  return (
    <>
      {/* ── CAMADA DE EMOJIS FLUTUANTES (ESTILO INSTAGRAM LIVE / KAHOOT) ── */}
      <div className={s.reactionsOverlay} aria-hidden="true">
        {floatingItems.map(item => (
          <div
            key={item.id}
            className={s.floatingEmojiItem}
            style={
              {
                left: `${item.left}%`,
                animationDuration: `${item.duration}s`,
                '--scale': item.scale,
              } as React.CSSProperties
            }
          >
            <span className={s.floatingEmojiText}>{item.emoji}</span>
            {item.senderName && item.senderName !== senderName && (
              <span className={s.floatingEmojiSender}>{item.senderName}</span>
            )}
          </div>
        ))}
      </div>

      {/* ── DOCK DE REAÇÕES RÁPIDAS ── */}
      {!isFinished && (
        <div className={s.reactionDockContainer}>
          <div className={s.reactionDock}>
            <span className={s.reactionDockLabel}>Reagir:</span>
            {REACTION_EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                className={s.reactionBtn}
                onClick={() => handleSendEmoji(emoji)}
                title={`Enviar reação ${emoji} para a mesa`}
                aria-label={`Reagir com ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
