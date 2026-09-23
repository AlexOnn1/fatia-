import { forwardRef } from 'react'
import type { Room, RankedParticipant, TableSummary, PodiumAward } from '../types'
import { formatBRL } from '../utils'
import { getAvatarInfo } from '../avatars'
import { useBrand } from '../context/BrandContext'

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
  const { brand } = useBrand()
  const top1 = ranking[0]
  const top2 = ranking[1]
  const top3 = ranking[2]

  const APP_URL = brand.appUrl
  const FONT_STACK = "'Fredoka', 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

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
          CARD 1: PÓDIO DOS CAMPEÕES & RESUMO DA MESA
      ══════════════════════════════════════════════════ */}
      <div
        ref={node => {
          if (typeof ref === 'function') return
          if (ref) ref.current = { ...(ref.current || { rankingRef: null }), podiumRef: node }
        }}
        id="share-podium-card"
        style={{
          width: '620px',
          background: 'linear-gradient(150deg, #1A1A1A 0%, #262626 50%, #151515 100%)',
          color: '#FFFFFF',
          padding: '36px 32px',
          fontFamily: FONT_STACK,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          borderRadius: '24px',
          border: `3px solid ${brand.theme.secondary}`,
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
            <span style={{ fontSize: '38px', lineHeight: 1 }}>{brand.item.emoji}</span>
            <span
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: '44px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: '#FFF4E6',
                lineHeight: 1,
              }}
            >
              {brand.appName.endsWith('$') ? (
                <>
                  {brand.appName.slice(0, -1)}
                  <span style={{ color: brand.theme.secondary }}>$</span>
                </>
              ) : (
                brand.appName
              )}
            </span>
          </div>

          <p
            style={{
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#FFD166',
              margin: '0 0 6px 0',
              lineHeight: 1.2,
            }}
          >
            ★ RESULTADO OFICIAL DO RODÍZIO ★
          </p>

          <h2
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: '26px',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: '0 0 4px 0',
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '540px',
              display: 'inline-block',
            }}
          >
            {room.name}
          </h2>

          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#BDBDBD',
              lineHeight: 1.2,
            }}
          >
            Rodízio: {formatBRL(room.valorRodizio)} por pessoa
          </div>
        </div>

        {/* PÓDIO VISUAL */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '14px',
            marginTop: '6px',
            paddingBottom: '4px',
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
              minWidth: 0,
            }}
          >
            {top2 ? (
              <>
                <img
                  src={getAvatarInfo(top2.emoji).src}
                  alt={top2.name}
                  style={{
                    width: '68px',
                    height: '68px',
                    objectFit: 'contain',
                    marginBottom: '6px',
                    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Fredoka', sans-serif",
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#E0E0E0',
                    maxWidth: '130px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.2,
                  }}
                >
                  {top2.name}
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#BDBDBD',
                    marginBottom: '8px',
                    lineHeight: 1.2,
                  }}
                >
                  {top2.fatias} {brand.item.plural}
                </span>
                <div
                  style={{
                    width: '100%',
                    height: '85px',
                    background: 'linear-gradient(180deg, #B0BEC5 0%, #78909C 100%)',
                    borderRadius: '14px 14px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Fredoka', sans-serif",
                      fontSize: '36px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      lineHeight: 1,
                    }}
                  >
                    2
                  </span>
                </div>
              </>
            ) : (
              <div style={{ height: '85px' }} />
            )}
          </div>

          {/* 1º Lugar */}
          <div
            style={{
              flex: 1.2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              minWidth: 0,
            }}
          >
            {top1 ? (
              <>
                <span style={{ fontSize: '32px', lineHeight: 1, marginBottom: '-6px' }}>👑</span>
                <img
                  src={getAvatarInfo(top1.emoji).src}
                  alt={top1.name}
                  style={{
                    width: '90px',
                    height: '90px',
                    objectFit: 'contain',
                    marginBottom: '6px',
                    filter: 'drop-shadow(0 6px 16px rgba(255, 209, 102, 0.65))',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Fredoka', sans-serif",
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#FFD166',
                    maxWidth: '150px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.2,
                  }}
                >
                  {top1.name}
                </span>
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    marginBottom: '8px',
                    lineHeight: 1.2,
                  }}
                >
                  {top1.fatias} {brand.item.plural}
                </span>
                <div
                  style={{
                    width: '100%',
                    height: '125px',
                    background: 'linear-gradient(180deg, #FFD166 0%, #F4A261 100%)',
                    borderRadius: '14px 14px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.45)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Fredoka', sans-serif",
                      fontSize: '46px',
                      fontWeight: 800,
                      color: '#242424',
                      lineHeight: 1,
                    }}
                  >
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
              minWidth: 0,
            }}
          >
            {top3 ? (
              <>
                <img
                  src={getAvatarInfo(top3.emoji).src}
                  alt={top3.name}
                  style={{
                    width: '68px',
                    height: '68px',
                    objectFit: 'contain',
                    marginBottom: '6px',
                    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Fredoka', sans-serif",
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#E0E0E0',
                    maxWidth: '130px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.2,
                  }}
                >
                  {top3.name}
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#BDBDBD',
                    marginBottom: '8px',
                    lineHeight: 1.2,
                  }}
                >
                  {top3.fatias} {brand.item.plural}
                </span>
                <div
                  style={{
                    width: '100%',
                    height: '65px',
                    background: 'linear-gradient(180deg, #D7CCC8 0%, #A1887F 100%)',
                    borderRadius: '14px 14px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Fredoka', sans-serif",
                      fontSize: '32px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      lineHeight: 1,
                    }}
                  >
                    3
                  </span>
                </div>
              </>
            ) : (
              <div style={{ height: '65px' }} />
            )}
          </div>
        </div>

        {/* PREMIAÇÕES CÔMICAS */}
        {awards.length > 0 && (
          <div
            style={{
              background: '#222222',
              borderRadius: '16px',
              padding: '16px 18px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxSizing: 'border-box',
            }}
          >
            <h4
              style={{
                margin: '0 0 10px 0',
                fontSize: '12px',
                fontWeight: 800,
                color: '#FFD166',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                lineHeight: 1.2,
              }}
            >
              🎖️ Premiações da Mesa
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {awards.slice(0, 4).map((aw, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#2C2C2C',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    boxSizing: 'border-box',
                  }}
                >
                  <span style={{ fontSize: '24px', lineHeight: 1, flexShrink: 0 }}>{aw.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Fredoka', sans-serif",
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {aw.title}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: '#FFD166',
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {aw.stat}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#9E9E9E',
                        marginTop: '2px',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      Ganhador: <strong style={{ color: '#E0E0E0' }}>{aw.recipientName}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROMBO COLETIVO */}
        <div
          style={{
            background: 'linear-gradient(135deg, #E63946 0%, #BD1E2D 100%)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            textAlign: 'center',
            boxShadow: '0 6px 18px rgba(230, 57, 70, 0.3)',
            boxSizing: 'border-box',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: '26px',
                fontWeight: 800,
                display: 'block',
                lineHeight: 1.1,
              }}
            >
              {summary.totalFatias}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.85)',
                textTransform: 'uppercase',
                lineHeight: 1.2,
              }}
            >
              {brand.item.plural.charAt(0).toUpperCase() + brand.item.plural.slice(1)} Totais
            </span>
          </div>

          <div>
            <span
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: '26px',
                fontWeight: 800,
                display: 'block',
                lineHeight: 1.1,
              }}
            >
              {summary.mediaFatias}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.85)',
                textTransform: 'uppercase',
                lineHeight: 1.2,
              }}
            >
              Média / Pessoa
            </span>
          </div>

          <div>
            <span
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: '24px',
                fontWeight: 800,
                color: summary.lucroMesa >= 0 ? '#2ECC71' : '#FFD166',
                display: 'block',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
              }}
            >
              {summary.lucroMesa >= 0
                ? `+${formatBRL(summary.lucroMesa)}`
                : `−${formatBRL(Math.abs(summary.lucroMesa))}`}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.85)',
                textTransform: 'uppercase',
                lineHeight: 1.2,
              }}
            >
              {summary.lucroMesa >= 0 ? 'Prejuízo do Dono' : 'Lucro do Dono'}
            </span>
          </div>
        </div>

        {/* RODAPÉ DO CARD 1 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '12px',
            fontWeight: 700,
            color: '#BDBDBD',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{APP_URL}</span>
            <span>•</span>
            <span style={{ color: brand.theme.secondary, fontWeight: 800 }}>{brand.appName}</span>
            <span>{brand.item.emoji}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Desenvolvido por</span>
            <span style={{ color: '#FFD166', fontWeight: 800, letterSpacing: '0.3px' }}>
              alexon.dev 🚀
            </span>
          </div>
        </div>
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
          width: '620px',
          background: 'linear-gradient(150deg, #1A1A1A 0%, #262626 50%, #151515 100%)',
          color: '#FFFFFF',
          padding: '36px 32px',
          fontFamily: FONT_STACK,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          borderRadius: '24px',
          border: `3px solid ${brand.theme.primary}`,
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
            <span style={{ fontSize: '38px', lineHeight: 1 }}>{brand.item.emoji}</span>
            <span
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: '44px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: '#FFF4E6',
                lineHeight: 1,
              }}
            >
              {brand.appName.endsWith('$') ? (
                <>
                  {brand.appName.slice(0, -1)}
                  <span style={{ color: brand.theme.primary }}>$</span>
                </>
              ) : (
                brand.appName
              )}
            </span>
          </div>

          <p
            style={{
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#FFD166',
              margin: '0 0 6px 0',
              lineHeight: 1.2,
            }}
          >
            ★ CLASSIFICAÇÃO GERAL DA MESA ★
          </p>

          <h2
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontSize: '26px',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: '0 0 4px 0',
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '540px',
              display: 'inline-block',
            }}
          >
            {room.name}
          </h2>

          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#BDBDBD',
              lineHeight: 1.2,
            }}
          >
            {summary.participantesCount} pessoas na disputa • {summary.totalFatias} fatias consumidas
          </div>
        </div>

        {/* LISTA DE PARTICIPANTES (FORMATO À PROVA DE SOBREPOSIÇÃO) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ranking.map((participant, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '▫️'
            const isTop1 = index === 0
            const isLucro = participant.calculation.status === 'lucro'
            const isPrejuizo = participant.calculation.status === 'prejuizo'

            return (
              <div
                key={participant.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isTop1
                    ? 'linear-gradient(90deg, #382C18 0%, #272727 100%)'
                    : '#262626',
                  border: isTop1 ? '2px solid #FFD166' : '1px solid rgba(255,255,255,0.08)',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  boxSizing: 'border-box',
                  gap: '14px',
                }}
              >
                {/* COLUNA ESQUERDA: MEDALHA + AVATAR + NOME & CONSUMO */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: '24px',
                      lineHeight: 1,
                      width: '32px',
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {medal}
                  </span>

                  <img
                    src={getAvatarInfo(participant.emoji).src}
                    alt={participant.name}
                    style={{
                      width: '46px',
                      height: '46px',
                      objectFit: 'contain',
                      flexShrink: 0,
                      filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      minWidth: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Fredoka', sans-serif",
                        fontSize: '17px',
                        fontWeight: 700,
                        color: isTop1 ? '#FFD166' : '#FFFFFF',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {participant.rank}º {participant.name}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#9E9E9E',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatBRL(participant.calculation.valorConsumido || 0)} consumidos
                    </span>
                  </div>
                </div>

                {/* COLUNA DIREITA: FATIAS & BADGE DE LUCRO (ISOLADOS EM COLUNA VERTICAL) */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px',
                    flexShrink: 0,
                    textAlign: 'right',
                  }}
                >
                  {/* LINHA 1: QUANTIDADE DE FATIAS */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '4px',
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Fredoka', sans-serif",
                        fontSize: '22px',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        lineHeight: 1,
                      }}
                    >
                      {participant.fatias}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#BDBDBD',
                        lineHeight: 1,
                      }}
                    >
                      {brand.item.plural}
                    </span>
                  </div>

                  {/* LINHA 2: BADGE PÍLULA DE LUCRO / PREJUÍZO (NUNCA COLIDE COM AS FATIAS) */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: isLucro
                        ? 'rgba(46, 204, 113, 0.15)'
                        : isPrejuizo
                        ? 'rgba(230, 57, 70, 0.15)'
                        : 'rgba(255, 209, 102, 0.15)',
                      border: `1px solid ${
                        isLucro
                          ? 'rgba(46, 204, 113, 0.4)'
                          : isPrejuizo
                          ? 'rgba(230, 57, 70, 0.4)'
                          : 'rgba(255, 209, 102, 0.4)'
                      }`,
                      whiteSpace: 'nowrap',
                      lineHeight: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: isLucro ? '#2ECC71' : isPrejuizo ? '#FF6B6B' : '#FFD166',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isLucro
                        ? `+${formatBRL(participant.calculation.lucro || 0)} lucro`
                        : isPrejuizo
                        ? `−${formatBRL(Math.abs(participant.calculation.lucro || 0))} prejuízo`
                        : 'empatou'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ROMBO COLETIVO NO RANKING (DESIGN BALANCEADO E SEM QUEBRAS ESTRANHAS) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #2D1B1E 0%, #1F1F1F 100%)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border:
              summary.lucroMesa >= 0
                ? '1px solid rgba(46, 204, 113, 0.3)'
                : '1px solid rgba(230, 57, 70, 0.3)',
            boxSizing: 'border-box',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background:
                  summary.lucroMesa >= 0
                    ? 'rgba(46, 204, 113, 0.15)'
                    : 'rgba(230, 57, 70, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0,
              }}
            >
              🍕
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#BDBDBD',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                Rombo Coletivo da Mesa
              </span>
              <span
                style={{
                  fontFamily: "'Fredoka', sans-serif",
                  fontSize: '20px',
                  fontWeight: 800,
                  color: summary.lucroMesa >= 0 ? '#2ECC71' : '#FF6B6B',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                {summary.lucroMesa >= 0
                  ? `+${formatBRL(summary.lucroMesa)} no lucro do estabelecimento`
                  : `−${formatBRL(Math.abs(summary.lucroMesa))} de prejuízo da mesa`}
              </span>
            </div>
          </div>

          <div
            style={{
              textAlign: 'right',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <span
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: '18px',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              {summary.totalFatias} {brand.item.plural}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#9E9E9E',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              Média: {summary.mediaFatias}/pessoa
            </span>
          </div>
        </div>

        {/* RODAPÉ DO CARD 2 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '12px',
            fontWeight: 700,
            color: '#BDBDBD',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{APP_URL}</span>
            <span>•</span>
            <span style={{ color: brand.theme.primary, fontWeight: 800 }}>{brand.appName}</span>
            <span>{brand.item.emoji}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Desenvolvido por</span>
            <span style={{ color: '#FFD166', fontWeight: 800, letterSpacing: '0.3px' }}>
              alexon.dev 🚀
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

ShareCards.displayName = 'ShareCards'
