import { useMemo } from 'react'
import { useBrand } from '../context/BrandContext'
import s from '../App.module.css'

interface BackgroundFallingItemsProps {
  totalFatias: number
  groupSize?: number
}

interface FallingItemSpec {
  id: number
  left: number // %
  size: number // px
  duration: number // seconds
  delay: number // seconds (negative so it's already mid-flight)
  opacity: number
  rotationDirection: number
}

export function BackgroundFallingItems({
  totalFatias,
  groupSize = 1,
}: BackgroundFallingItemsProps) {
  const { brand } = useBrand()

  // Se ninguém consumiu nada ainda, fundo fica limpo
  if (totalFatias <= 0) return null

  // Calcular densidade com base em totalFatias e tamanho do grupo
  const groupMultiplier = Math.min(2.5, 0.9 + (groupSize - 1) * 0.22)
  const calculatedItemsCount = Math.min(
    40,
    Math.max(3, Math.floor((totalFatias * groupMultiplier) / 1.8) + 2)
  )

  const items = useMemo(() => {
    const list: FallingItemSpec[] = []
    for (let i = 0; i < calculatedItemsCount; i++) {
      list.push({
        id: i,
        left: (i * (100 / calculatedItemsCount) + (Math.random() * 8 - 4)) % 96 + 2,
        size: 22 + Math.floor(Math.random() * 18), // 22px a 40px
        duration: 11 + Math.random() * 12, // 11s a 23s (queda lenta e agradável)
        delay: -(Math.random() * 20), // delay negativo para preencher a tela imediatamente
        opacity: 0.16 + Math.random() * 0.16, // 0.16 a 0.32 (suave no fundo)
        rotationDirection: Math.random() > 0.5 ? 1 : -1,
      })
    }
    return list
  }, [calculatedItemsCount])

  return (
    <div className={s.fallingBgContainer} aria-hidden="true">
      {items.map(spec => (
        <span
          key={spec.id}
          className={s.fallingItem}
          style={
            {
              left: `${spec.left}%`,
              fontSize: `${spec.size}px`,
              opacity: spec.opacity,
              animationDuration: `${spec.duration}s`,
              animationDelay: `${spec.delay}s`,
              '--rot-dir': spec.rotationDirection,
            } as React.CSSProperties
          }
        >
          {brand.item.emoji}
        </span>
      ))}
    </div>
  )
}
