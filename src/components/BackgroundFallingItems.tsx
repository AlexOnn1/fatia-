import { useState, useEffect, useRef } from 'react'
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
  delay: number // seconds
  opacity: number
  rotationDirection: number
  sway: number // px horizontal drift
}

// Cria uma especificação com 3 camadas de profundidade (fundo distante, médio e primeiro plano)
function createFallingSpec(id: number, leftPercent: number, delay: number): FallingItemSpec {
  const depthRand = Math.random()
  // 45% fundo distante (sutil e lento), 37% médio, 18% primeiro plano (grande e veloz)
  const depth = depthRand < 0.45 ? 0 : depthRand < 0.82 ? 1 : 2

  let size: number
  let duration: number
  let opacity: number

  if (depth === 0) {
    // Fundo distante: menor, mais lento, sutil
    size = 18 + Math.floor(Math.random() * 8) // 18px - 26px
    duration = 16 + Math.random() * 9 // 16s - 25s
    opacity = 0.13 + Math.random() * 0.10 // 0.13 - 0.23
  } else if (depth === 1) {
    // Meio: tamanho padrão, velocidade média
    size = 28 + Math.floor(Math.random() * 10) // 28px - 38px
    duration = 11 + Math.random() * 6 // 11s - 17s
    opacity = 0.20 + Math.random() * 0.12 // 0.20 - 0.32
  } else {
    // Primeiro plano: fatias grandes, descendo mais rápido e vívidas
    size = 40 + Math.floor(Math.random() * 14) // 40px - 54px
    duration = 7 + Math.random() * 5 // 7s - 12s
    opacity = 0.28 + Math.random() * 0.14 // 0.28 - 0.42
  }

  // Oscilação suave horizontal (-18px a +18px)
  const sway = Math.round(Math.random() * 36 - 18)

  return {
    id,
    left: leftPercent,
    size,
    duration,
    delay,
    opacity,
    rotationDirection: Math.random() > 0.5 ? 1 : -1,
    sway,
  }
}

export function BackgroundFallingItems({
  totalFatias,
  groupSize = 1,
}: BackgroundFallingItemsProps) {
  const { brand } = useBrand()
  const [items, setItems] = useState<FallingItemSpec[]>([])
  const nextIdRef = useRef(1)
  // Se já começar com fatias (ex: sala carregada com dados existentes), preenche a tela imediatamente
  const isInitialPopulateRef = useRef(totalFatias > 0)

  // Volume épico e acumulativo estilo Cookie Clicker:
  // Quanto mais fatias o grupo ou o usuário come, mais e mais denso e volumoso fica!
  // Cada fatia adiciona entre 3 a 5 novas fatias caindo, acumulando densidade contínua
  const groupMultiplier = Math.max(1, 1 + (Math.max(1, groupSize) - 1) * 0.15)
  const targetCount =
    totalFatias <= 0
      ? 0
      : Math.min(450, Math.floor(totalFatias * 3.8 * groupMultiplier) + 3)

  useEffect(() => {
    setItems(prevItems => {
      // Se não há fatias consumidas, limpa o fundo
      if (targetCount === 0) {
        isInitialPopulateRef.current = false
        return []
      }

      // 1. CARREGAMENTO INICIAL COM DADOS: Se a página já abriu com fatias (ex: link de sala com dados),
      // distribui verticalmente com delay negativo para a tela já estar cheia de pizzas caindo
      if (prevItems.length === 0 && isInitialPopulateRef.current) {
        isInitialPopulateRef.current = false
        const initialList: FallingItemSpec[] = []
        for (let i = 0; i < targetCount; i++) {
          const left = (i * (100 / targetCount) + (Math.random() * 6 - 3)) % 94 + 3
          const spec = createFallingSpec(nextIdRef.current++, left, 0)
          spec.delay = -(Math.random() * spec.duration)
          initialList.push(spec)
        }
        return initialList
      }

      isInitialPopulateRef.current = false

      // 2. AUMENTO GRADUAL E VOLUMOSO: Quando fatias são comidas, APENAS ADICIONA novos itens!
      // Os itens que já estavam na tela CONTINUAM caindo sem saltos nem recarregamento!
      if (targetCount > prevItems.length) {
        const addedCount = targetCount - prevItems.length
        const newItems: FallingItemSpec[] = []
        for (let i = 0; i < addedCount; i++) {
          const left = Math.random() * 92 + 4
          // Stagger suave para o fluxo de novas fatias descer do topo com fluidez
          const delay = Math.min(2.5, i * 0.08) + Math.random() * 0.15
          newItems.push(createFallingSpec(nextIdRef.current++, left, delay))
        }
        return [...prevItems, ...newItems]
      }

      // 3. REDUÇÃO (caso fatias sejam subtraídas)
      if (targetCount < prevItems.length) {
        return prevItems.slice(0, targetCount)
      }

      return prevItems
    })
  }, [targetCount])

  if (items.length === 0) return null

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
              '--sway': `${spec.sway}px`,
            } as React.CSSProperties
          }
        >
          {brand.item.emoji}
        </span>
      ))}
    </div>
  )
}
