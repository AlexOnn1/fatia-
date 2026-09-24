// Utilitário seguro para vibrações táteis (Haptic Feedback) no mobile

export type HapticType = 'tap' | 'light' | 'success' | 'warning'

export function triggerHaptic(type: HapticType = 'tap') {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return
  if (!('vibrate' in navigator)) return

  try {
    switch (type) {
      case 'tap':
        // Micro-vibração ao tocar em botões de adição
        navigator.vibrate(25)
        break
      case 'light':
        // Toque ainda mais sutil para decremento
        navigator.vibrate(15)
        break
      case 'success':
        // Sequência de celebração para empate / lucro
        navigator.vibrate([40, 50, 70])
        break
      case 'warning':
        // Padrão de alerta duplo
        navigator.vibrate([30, 40, 30])
        break
    }
  } catch {
    // Ignorar falhas silenciosamente caso o dispositivo ou SO bloqueie
  }
}
