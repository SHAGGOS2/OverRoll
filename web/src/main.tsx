import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { clearOverRollStorage, repairOverRollStorage } from './storageGuard.ts'
import { detectBrowserLocale } from './localization'
import { translateUiText } from './uiLocalization'

type BoundaryProps = { children: ReactNode }
type BoundaryState = { failed: boolean }

class AppErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false }

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('OverRoll no pudo renderizar la interfaz.', error, info)
  }

  private resetLocalData = () => {
    const locale = detectBrowserLocale()
    if (!window.confirm(translateUiText(locale, 'Esto borrará perfiles, nombres, reglas, ruleta y configuración guardada en este navegador. ¿Continuar?'))) return
    clearOverRollStorage()
    window.location.reload()
  }

  render() {
    if (!this.state.failed) return this.props.children
    const tr = (text: string) => translateUiText(detectBrowserLocale(), text)

    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, color: '#f3f8fc', background: '#02070d', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
        <section style={{ width: 'min(560px, 100%)', padding: 24, border: '1px solid #d89400', background: '#07141f' }}>
          <small style={{ color: '#ffc43b', fontWeight: 650 }}>OverRoll</small>
          <h1 style={{ margin: '10px 0 8px', fontSize: 28 }}>{tr('No se pudo abrir OverRoll')}</h1>
          <p style={{ margin: '0 0 18px', color: '#9ab4c5', lineHeight: 1.55 }}>{tr('Vuelve a cargar la página para intentarlo de nuevo.')}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button type="button" onClick={() => window.location.reload()} style={{ minHeight: 44, padding: '0 18px', border: '1px solid #ffc43b', borderRadius: 6, color: '#101820', background: '#ffc43b', fontWeight: 650, cursor: 'pointer' }}>{tr('Volver a cargar')}</button>
            <button type="button" onClick={this.resetLocalData} style={{ minHeight: 44, padding: '0 18px', border: '1px solid #354454', borderRadius: 6, color: '#abbccc', background: 'transparent', cursor: 'pointer' }}>{tr('Restablecer datos locales')}</button>
          </div>
        </section>
      </main>
    )
  }
}

repairOverRollStorage()

const root = document.getElementById('root')
if (!root) throw new Error('No se encontró el contenedor raíz de OverRoll.')

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
