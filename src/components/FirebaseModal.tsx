import { useState } from 'react'
import {
  isFirebaseConfigured,
  activeFirebaseConfig,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  type FirebaseConfigData,
} from '../services/firebase'
import s from '../App.module.css'

interface FirebaseModalProps {
  onClose: () => void
}

export function FirebaseModal({ onClose }: FirebaseModalProps) {
  const [apiKey, setApiKey] = useState(activeFirebaseConfig.apiKey || '')
  const [authDomain, setAuthDomain] = useState(activeFirebaseConfig.authDomain || '')
  const [databaseURL, setDatabaseURL] = useState(activeFirebaseConfig.databaseURL || '')
  const [projectId, setProjectId] = useState(activeFirebaseConfig.projectId || '')
  const [storageBucket, setStorageBucket] = useState(activeFirebaseConfig.storageBucket || '')
  const [messagingSenderId, setMessagingSenderId] = useState(activeFirebaseConfig.messagingSenderId || '')
  const [appId, setAppId] = useState(activeFirebaseConfig.appId || '')
  const [jsonInput, setJsonInput] = useState('')
  const [showJsonInput, setShowJsonInput] = useState(false)
  const [copiedRules, setCopiedRules] = useState(false)

  const handleJsonPaste = () => {
    try {
      // Procurar por objeto JSON ou propriedades soltas
      const jsonMatch = jsonInput.match(/\{[\s\S]*\}/)
      const targetStr = jsonMatch ? jsonMatch[0] : jsonInput
      // Limpar se tiver const firebaseConfig =
      const cleaned = targetStr
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
        .replace(/'/g, '"')

      const parsed = JSON.parse(cleaned)
      if (parsed.apiKey) setApiKey(parsed.apiKey)
      if (parsed.authDomain) setAuthDomain(parsed.authDomain)
      if (parsed.databaseURL) setDatabaseURL(parsed.databaseURL)
      if (parsed.projectId) setProjectId(parsed.projectId)
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket)
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId)
      if (parsed.appId) setAppId(parsed.appId)
      setShowJsonInput(false)
    } catch {
      alert('Não foi possível ler o JSON. Por favor, cole os campos individualmente.')
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const config: FirebaseConfigData = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      databaseURL: databaseURL.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    }
    saveCustomFirebaseConfig(config)
  }

  const handleClear = () => {
    if (confirm('Deseja remover a configuração personalizada do Firebase?')) {
      clearCustomFirebaseConfig()
    }
  }

  const copyRules = () => {
    const rules = `{\n  "rules": {\n    "rooms": {\n      ".read": true,\n      ".write": true\n    }\n  }\n}`
    navigator.clipboard?.writeText(rules)
    setCopiedRules(true)
    setTimeout(() => setCopiedRules(false), 2000)
  }

  return (
    <div className={s.modalBackdrop}>
      <div className={s.firebaseModal}>
        <button className={s.modalCloseBtn} onClick={onClose} aria-label="Fechar">
          ✕
        </button>

        <div className={s.firebaseHeader}>
          <span className={s.firebaseIcon}>🔥</span>
          <h2 className={s.firebaseTitle}>Configurar Firebase</h2>
          <p className={s.firebaseSubtitle}>
            Conecte múltiplos celulares na mesma mesa em tempo real de forma 100% gratuita!
          </p>
        </div>

        <div className={s.firebaseStatusBox}>
          Status Atual:{' '}
          {isFirebaseConfigured ? (
            <strong style={{ color: 'var(--green-dark)' }}>🟢 Conectado na Nuvem</strong>
          ) : (
            <strong style={{ color: 'var(--red-dark)' }}>🟡 Modo Local (Offline)</strong>
          )}
        </div>

        {/* GUIA PASSO A PASSO */}
        <div className={s.firebaseSteps}>
          <h3 className={s.stepsTitle}>Como criar seu banco gratuito (2 min):</h3>
          <ol className={s.stepsList}>
            <li>
              Acesse o{' '}
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className={s.link}
              >
                Firebase Console ↗
              </a>{' '}
              e crie um projeto gratuito.
            </li>
            <li>
              No menu lateral, vá em <strong>Build &gt; Realtime Database</strong> e clique em{' '}
              <strong>Criar Banco de Dados</strong>.
            </li>
            <li>
              Na aba <strong>Regras (Rules)</strong>, permita leitura e escrita:{' '}
              <button type="button" className={s.copyRulesBtn} onClick={copyRules}>
                {copiedRules ? 'Copiado! ✅' : 'Copiar Regras 📋'}
              </button>
            </li>
            <li>
              Nas <strong>Configurações do Projeto ⚙️</strong>, adicione um aplicativo <strong>Web (&lt;/&gt;)</strong> e copie as credenciais abaixo.
            </li>
          </ol>
        </div>

        {/* OPÇÃO DE COLAR JSON */}
        <div className={s.jsonToggleWrap}>
          <button
            type="button"
            className={s.textBtn}
            onClick={() => setShowJsonInput(!showJsonInput)}
          >
            {showJsonInput ? '▲ Ocultar colagem de código' : '▼ Colar bloco firebaseConfig do console'}
          </button>
          {showJsonInput && (
            <div className={s.jsonBox}>
              <textarea
                className={s.jsonTextarea}
                placeholder="Cole aqui o objeto: { apiKey: '...', databaseURL: '...', ... }"
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
                rows={4}
              />
              <button type="button" className={s.secondaryBtn} onClick={handleJsonPaste}>
                Preencher Campos
              </button>
            </div>
          )}
        </div>

        {/* FORMULÁRIO DE CREDENCIAIS */}
        <form onSubmit={handleSave} className={s.firebaseForm}>
          <div className={s.formGroupSmall}>
            <label className={s.label}>API Key</label>
            <input
              type="text"
              className={s.textInputSmall}
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              required
            />
          </div>

          <div className={s.formGroupSmall}>
            <label className={s.label}>Database URL (Obrigatório)</label>
            <input
              type="url"
              className={s.textInputSmall}
              placeholder="https://seu-projeto-default-rtdb.firebaseio.com"
              value={databaseURL}
              onChange={e => setDatabaseURL(e.target.value)}
              required
            />
          </div>

          <div className={s.formGroupSmall}>
            <label className={s.label}>Project ID</label>
            <input
              type="text"
              className={s.textInputSmall}
              placeholder="meu-projeto-fatia"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              required
            />
          </div>

          <div className={s.formGroupSmall}>
            <label className={s.label}>Auth Domain (Opcional)</label>
            <input
              type="text"
              className={s.textInputSmall}
              placeholder="meu-projeto.firebaseapp.com"
              value={authDomain}
              onChange={e => setAuthDomain(e.target.value)}
            />
          </div>

          <div className={s.firebaseModalActions}>
            <button type="submit" className={s.primaryBtn}>
              💾 Salvar e Conectar
            </button>
            {isFirebaseConfigured && (
              <button type="button" className={s.leaveBtn} onClick={handleClear}>
                🗑️ Limpar Configuração
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
