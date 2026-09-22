import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'

export interface FirebaseConfigData {
  apiKey?: string
  authDomain?: string
  databaseURL?: string
  projectId?: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
}

const STORAGE_KEY = 'fatia_firebase_config'

function getStoredConfig(): FirebaseConfigData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as Record<string, string>)
const stored = typeof window !== 'undefined' ? getStoredConfig() : null

const resolvedProjectId = stored?.projectId || env.VITE_FIREBASE_PROJECT_ID
const defaultDbUrl = resolvedProjectId ? `https://${resolvedProjectId}-default-rtdb.firebaseio.com` : undefined

export const activeFirebaseConfig: FirebaseConfigData = {
  apiKey: stored?.apiKey || env.VITE_FIREBASE_API_KEY,
  authDomain: stored?.authDomain || env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: stored?.databaseURL || env.VITE_FIREBASE_DATABASE_URL || defaultDbUrl,
  projectId: resolvedProjectId,
  storageBucket: stored?.storageBucket || env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: stored?.messagingSenderId || env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: stored?.appId || env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  activeFirebaseConfig.apiKey &&
  activeFirebaseConfig.databaseURL &&
  activeFirebaseConfig.projectId
)

let app: FirebaseApp | null = null
let db: Database | null = null

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(activeFirebaseConfig) : getApps()[0]
    db = getDatabase(app)
  } catch (err) {
    console.warn('Falha ao inicializar Firebase. Operando no modo local:', err)
    db = null
  }
}

export function saveCustomFirebaseConfig(config: FirebaseConfigData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  window.location.reload()
}

export function clearCustomFirebaseConfig() {
  localStorage.removeItem(STORAGE_KEY)
  window.location.reload()
}

export { app, db }
