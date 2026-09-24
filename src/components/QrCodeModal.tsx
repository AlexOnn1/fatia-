import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { useBrand } from '../context/BrandContext'
import s from '../App.module.css'

interface QrCodeModalProps {
  roomCode: string
  roomName: string
  onClose: () => void
}

export function QrCodeModal({ roomCode, roomName, onClose }: QrCodeModalProps) {
  const { brand } = useBrand()
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [copied, setCopied] = useState<string | null>(null)

  const joinUrl = `${window.location.origin}${window.location.pathname}?sala=${roomCode}`

  useEffect(() => {
    QRCode.toDataURL(joinUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Erro ao gerar QR Code:', err))
  }, [joinUrl])

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(joinUrl)
    setCopied('Link copiado!')
    setTimeout(() => setCopied(null), 2500)
  }

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(roomCode)
    setCopied('Código copiado!')
    setTimeout(() => setCopied(null), 2500)
  }

  return (
    <div className={s.qrModalOverlay} onClick={onClose}>
      <div className={s.qrModalContent} onClick={e => e.stopPropagation()}>
        <button
          type="button"
          className={s.qrCloseBtn}
          onClick={onClose}
          aria-label="Fechar modal"
        >
          ✕
        </button>

        <div className={s.qrHeader}>
          <span className={s.qrEmojiBadge}>📷</span>
          <h2 className={s.qrTitle}>Convite para a Mesa</h2>
          <p className={s.qrSubtitle}>{roomName}</p>
        </div>

        {/* Imagem do QR Code gerado */}
        <div className={s.qrCanvasWrap}>
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code para entrar na sala ${roomCode}`}
              className={s.qrImage}
            />
          ) : (
            <div className={s.qrLoading}>Gerando QR Code...</div>
          )}
        </div>

        <p className={s.qrInstruction}>
          Aponte a câmera do celular para entrar instantaneamente sem precisar digitar!
        </p>

        {/* Código da sala destacado */}
        <div className={s.qrCodeBox} onClick={handleCopyCode} title="Clique para copiar">
          <span className={s.qrCodeBoxLabel}>CÓDIGO DA SALA:</span>
          <span className={s.qrCodeBoxVal}>{roomCode}</span>
          <span className={s.qrCopyIcon}>📋</span>
        </div>

        {/* Botões de ação */}
        <div className={s.qrActionRow}>
          <button type="button" className={s.qrCopyLinkBtn} onClick={handleCopyLink}>
            🔗 Copiar Link de Convite
          </button>
        </div>

        {copied && <div className={s.qrToastFeedback}>✅ {copied}</div>}

        <p className={s.qrFooterBranding}>
          Desenvolvido com {brand.item.emoji} por{' '}
          <a
            href="https://alexon.dev"
            target="_blank"
            rel="noopener noreferrer"
            className={s.devBrandLink}
          >
            alexon.dev
          </a>
        </p>
      </div>
    </div>
  )
}
