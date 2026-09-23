import { forwardRef } from 'react'
import type { Room, RankedParticipant, TableSummary, PodiumAward } from '../types'
import { formatBRL } from '../utils'
import { getAvatarInfo } from '../avatars'

interface ShareCardsProps {
  room: Room
  ranking: RankedParticipant[]
  summary: TableSummary
  awards: PodiumAward[]
}

export const ShareCards = forwardRef<
  { podiumRef: HTMLDivElement | null; rankingRef: HTMLDivElement | null },
  ShareCardsProps
>(({ room, ranking, summary, awards }, ref) => {
  const top1 = ranking[0]
  const top2 = ranking[1]
  const top3 = ranking[2]

  return (
    <div
      style={{
        position: 'fixed',
        left: '-9999px',
        top: 0,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      {/* ══════════════════════════════════════════════════
          CARD 1: PÓDIO DOS CAMPEÕES & RESUMO
      ══════════════════════════════════════════════════ */}
      <div
        ref={node => {
          if (typeof ref === 'function') return
          if (ref) ref.current = { ...(ref.current || { rankingRef: null }), podiumRef: node }
        }}
        id="share-podium-card"
        style={{
          width: '600px',
          background: 'linear-gradient(145deg, #1F1F1F 0%, #2A2A2A 50%, #171717 100%)',
          color: '#FFFFFF',
          padding: '36px 32px',
          fontFamily: "'Nunito', sans-serif",
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          borderRadius: '24px',
          border: '3px solid #F4A261',
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '6px',
            }}
          >
            <span style={{ fontSize: '38px', lineHeight: 1 }}>🍕</span>
            <span
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: '44px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: '#FFF4E6',
              }}
            >
              Fatia<span style={{ color: '#F4A261' }}>$</span>
            </span>
          </div>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#FFD166',
              margin: '0 0 4px 0',
            }}
          >
            ★ RESULTADO OFICIAL DO RODÍZIO ★
          </p>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            {room.name}
          </h2>
          <span style={{ fontSize: '13px', color: '#BDBDBD' }}>
            Rodízio: {formatBRL(room.valorRodizio)} por pessoa
          </span>
        </div>

        {/* PÓDIO VISUAL */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '10px',
            paddingBottom: '8px',
          }}
        >
          {/* 2º Lugar */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {top2 ? (
              <>
                <img
                  src={getAvatarInfo(top2.emoji).src}
                  alt={top2.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    objectFit: 'contain',
                    marginBottom: '6px',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                  }}
                />
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#E0E0E0',
                    maxWidth: '120px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {top2.name}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#BDBDBD', marginBottom: '8px' }}>
                  {top2.fatias} fatias
                </span>
                <div
                  style={{
                    width: '100%',
                    height: '80px',
                    background: 'linear-gradient(180deg, #B0BEC5 0%, #78909C 100%)',
                    borderRadius: '12px 12px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)',
                  }}
                >
                  <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '34px', fontWeight: 800, color: '#FFFFFF' }}>
                    2
                  </span>
                </div>
              </>
            ) : null}
          </div>

          {/* 1º Lugar */}
          <div
            style={{
              flex: 1.15,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {top1 ? (
              <>
                <span style={{ fontSize: '28px', lineHeight: 1, marginBottom: '-6px' }}>👑</span>
                <img
                  src={getAvatarInfo(top1.emoji).src}
                  alt={top1.name}
                  style={{
                    width: '84px',
                    height: '84px',
                    objectFit: 'contain',
                    marginBottom: '6px',
                    filter: 'drop-shadow(0 6px 14px rgba(255, 209, 102, 0.6))',
                  }}
                />
                <span
                  style={{
                    fontSize: '17px',
                    fontWeight: 800,
                    color: '#FFD166',
                    maxWidth: '140px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {top1.name}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                  {top1.fatias} fatias
                </span>
                <div
                  style={{
                    width: '100%',
                    height: '115px',
                    background: 'linear-gradient(180deg, #FFD166 0%, #F4A261 100%)',
                    borderRadius: '12px 12px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4)',
                  }}
                >
                  <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '42px', fontWeight: 800, color: '#2D2D2D' }}>
                    1
                  </span>
                </div>
              </>
            ) : null}
          </div>

          {/* 3º Lugar */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {top3 ? (
              <>
                <img
                  src={getAvatarInfo(top3.emoji).src}
                  alt={top3.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    objectFit: 'contain',
                    marginBottom: '6px',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                  }}
                />
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#E0E0E0',
                    maxWidth: '120px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {top3.name}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#BDBDBD', marginBottom: '8px' }}>
                  {top3.fatias} fatias
                </span>
                <div
                  style={{
                    width: '100%',
                    height: '60px',
                    background: 'linear-gradient(180deg, #D7CCC8 0%, #A1887F 100%)',
                    borderRadius: '12px 12px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)',
                  }}
                >
                  <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '28px', fontWeight: 800, color: '#FFFFFF' }}>
                    3
                  </span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* TROFÉUS CÔMICOS */}
        {awards.length > 0 && (
          <div
            style={{
              background: '#242424',
              borderRadius: '16px',
              padding: '16px 20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h4
              style={{
                margin: '0 0 12px 0',
                fontSize: '13px',
                fontWeight: 800,
                color: '#FFD166',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              🎖️ Premiações da Mesa
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {awards.map((aw, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#2F2F2F',
                    padding: '8px 12px',
                    borderRadius: '10px',
                  }}
                >
                  <span style={{ fontSize: '22px' }}>{aw.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{aw.title}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFD166' }}>{aw.stat}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#BDBDBD' }}>
                      Ganhador: <strong>{aw.recipientName}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROMBO COLETIVO */}
        <div
          style={{
            background: 'linear-gradient(135deg, #E63946 0%, #C0202D 100%)',
            borderRadius: '16px',
            padding: '18px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            textAlign: 'center',
            boxShadow: '0 6px 18px rgba(230, 57, 70, 0.35)',
          }}
        >
          <div>
            <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '26px', fontWeight: 800, display: 'block' }}>
              {summary.totalFatias}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' }}>
              Fatias Totais
            </span>
          </div>
          <div>
            <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: '26px', fontWeight: 800, display: 'block' }}>
              {summary.mediaFatias}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' }}>
              Média / Pessoa
            </span>
          </div>
          <div>
            <span
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: '26px',
                fontWeight: 800,
                color: summary.lucroMesa >= 0 ? '#2ECC71' : '#FFD166',
                display: 'block',
              }}
            >
              {summary.lucroMesa >= 0
                ? `+${formatBRL(summary.lucroMesa)}`
                : `−${formatBRL(Math.abs(summary.lucroMesa))}`}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' }}>
              {summary.lucroMesa >= 0 ? 'Prejuízo do Dono' : 'Lucro do Dono'}
            </span>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#757575', margin: 0 }}>
          fatia.app — Contador Oficial de Rodízio 🍕
        </p>
      </div>

      {/* ══════════════════════════════════════════════════
          CARD 2: CLASSIFICAÇÃO GERAL / RANKING COMPLETO
      ══════════════════════════════════════════════════ */}
      <div
        ref={node => {
          if (typeof ref === 'function') return
          if (ref) ref.current = { ...(ref.current || { podiumRef: null }), rankingRef: node }
        }}
        id="share-ranking-card"
        style={{
          width: '600px',
          background: 'linear-gradient(145deg, #1F1F1F 0%, #2A2A2A 50%, #171717 100%)',
          color: '#FFFFFF',
          padding: '36px 32px',
          fontFamily: "'Nunito', sans-serif",
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          borderRadius: '24px',
          border: '3px solid #E63946',
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '6px',
            }}
          >
            <span style={{ fontSize: '38px', lineHeight: 1 }}>🍕</span>
            <span
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: '44px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: '#FFF4E6',
              }}
            >
              Fatia<span style={{ color: '#E63946' }}>$</span>
            </span>
          </div>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#FFD166',
              margin: '0 0 4px 0',
            }}
          >
            ★ CLASSIFICAÇÃO GERAL DA MESA ★
          </p>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            {room.name}
          </h2>
          <span style={{ fontSize: '13px', color: '#BDBDBD' }}>
            {summary.participantesCount} pessoas na disputa • {summary.totalFatias} fatias no total
          </span>
        </div>

        {/* LISTA COMPLETA DE PARTICIPANTES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ranking.map((participant, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '▫️'
            const isTop1 = index === 0

            return (
              <div
                key={participant.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: isTop1 ? 'linear-gradient(90deg, #3A2F1A 0%, #2A2A2A 100%)' : '#2A2A2A',
                  border: isTop1 ? '2px solid #FFD166' : '1px solid rgba(255,255,255,0.1)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                }}
              >
                <span style={{ fontSize: '20px', minWidth: '28px', textAlign: 'center' }}>
                  {medal}
                </span>

                <img
                  src={getAvatarInfo(participant.emoji).src}
                  alt={participant.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: isTop1 ? '#FFD166' : '#FFFFFF',
                      }}
                    >
                      {participant.rank}º {participant.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Fredoka', sans-serif",
                        fontSize: '20px',
                        fontWeight: 800,
                        color: '#FFFFFF',
                      }}
                    >
                      {participant.fatias} <span style={{ fontSize: '12px', fontWeight: 600, color: '#BDBDBD' }}>fatias</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '3px' }}>
                    <span style={{ color: '#9E9E9E' }}>
                      {formatBRL(participant.calculation.valorConsumido || 0)} consumidos
                    </span>
                    <span
                      style={{
                        fontWeight: 800,
                        color:
                          participant.calculation.status === 'lucro'
                            ? '#2ECC71'
                            : participant.calculation.status === 'prejuizo'
                            ? '#FF6B6B'
                            : '#FFD166',
                      }}
                    >
                      {participant.calculation.status === 'lucro'
                        ? `+${formatBRL(participant.calculation.lucro || 0)} lucro`
                        : participant.calculation.status === 'prejuizo'
                        ? `−${formatBRL(Math.abs(participant.calculation.lucro || 0))} prejuízo`
                        : 'empatou'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* RODAPÉ DO RANKING */}
        <div
          style={{
            background: '#242424',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', color: '#9E9E9E', textTransform: 'uppercase' }}>
              Rombo Coletivo
            </span>
            <p
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: '18px',
                fontWeight: 800,
                color: summary.lucroMesa >= 0 ? '#2ECC71' : '#FF6B6B',
                margin: 0,
              }}
            >
              {summary.lucroMesa >= 0
                ? `+${formatBRL(summary.lucroMesa)} na conta da pizzaria`
                : `−${formatBRL(Math.abs(summary.lucroMesa))} deixado p/ pizzaria`}
            </p>
          </div>
          <span style={{ fontSize: '24px' }}>🍕</span>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#757575', margin: 0 }}>
          fatia.app — Contador Oficial de Rodízio 🍕
        </p>
      </div>
    </div>
  )
})

ShareCards.displayName = 'ShareCards'
