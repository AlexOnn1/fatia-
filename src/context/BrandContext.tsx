import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import type { TenantConfig } from '../types'
import { getActiveTenant, TENANT_REGISTRY } from '../config/tenantConfig'

export type FinancialStatus = 'neutral' | 'neutro' | 'prejuizo' | 'empate' | 'lucro'

interface BrandContextType {
  brand: TenantConfig
  formatUnits: (count: number) => string
  formatConsumed: (count: number) => string
  setTenantId: (id: string) => void
  userFinancialStatus: FinancialStatus
  setUserFinancialStatus: (status: FinancialStatus) => void
}

const BrandContext = createContext<BrandContextType | undefined>(undefined)

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<TenantConfig>(() => getActiveTenant())
  const [userFinancialStatus, setUserFinancialStatus] = useState<FinancialStatus>('neutral')

  const setTenantId = (id: string) => {
    if (TENANT_REGISTRY[id]) {
      setBrand(TENANT_REGISTRY[id])
    }
  }

  // Injetar variáveis CSS dinamicamente no :root
  useEffect(() => {
    const root = document.documentElement
    const theme = brand.theme

    root.style.setProperty('--red', theme.primary)
    root.style.setProperty('--red-dark', theme.primaryDark)
    root.style.setProperty('--red-light', `${theme.primary}1f`)
    root.style.setProperty('--red-border', `${theme.primary}4d`)

    root.style.setProperty('--orange', theme.secondary)
    root.style.setProperty('--yellow', theme.accent)
    root.style.setProperty('--yellow-dim', `${theme.accent}2e`)

    root.style.setProperty('--bg', theme.bg)
    root.style.setProperty('--surface', theme.surface)
    root.style.setProperty('--surface-alt', theme.surfaceAlt)

    root.style.setProperty('--dark', theme.dark)
    root.style.setProperty('--dark-mid', theme.darkMid)

    // Atualizar título da página
    document.title = `${brand.appName} — ${brand.tagline}`
  }, [brand])

  const formatUnits = useMemo(() => {
    return (count: number) => {
      const isSingle = count === 1
      return `${count} ${isSingle ? brand.item.singular : brand.item.plural}`
    }
  }, [brand.item.singular, brand.item.plural])

  const formatConsumed = useMemo(() => {
    return (count: number) => {
      const isSingle = count === 1
      const unit = isSingle ? brand.item.singular : brand.item.plural
      const action = brand.item.unitGender === 'o' ? (isSingle ? 'comido' : 'comidos') : (isSingle ? 'comida' : 'comidas')
      return `${count} ${unit} ${action}`
    }
  }, [brand.item.singular, brand.item.plural, brand.item.unitGender])

  const value = useMemo(
    () => ({
      brand,
      formatUnits,
      formatConsumed,
      setTenantId,
      userFinancialStatus,
      setUserFinancialStatus,
    }),
    [brand, formatUnits, formatConsumed, userFinancialStatus]
  )

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}

export function useBrand(): BrandContextType {
  const context = useContext(BrandContext)
  if (!context) {
    throw new Error('useBrand deve ser utilizado dentro de um BrandProvider')
  }
  return context
}
