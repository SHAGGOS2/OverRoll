import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { clearOverRollStorage, repairOverRollStorage } from './storageGuard.ts'

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
    clearOverRollStorage()
    window.location.reload()
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, color: '#f3f8fc', background: '#02070d', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
        <section style={{ width: 'min(560px, 100%)', padding: 24, border: '1px solid #d89400', background: '#07141f' }}>
          <small style={{ color: '#ffc43b', fontWeight: 800, letterSpacing: '.08em' }}>RECUPERACIÓN DE OVERROLL</small>
          <h1 style={{ margin: '10px 0 8px', fontSize: 28 }}>La configuración guardada no es compatible</h1>
          <p style={{ margin: '0 0 18px', color: '#9ab4c5', lineHeight: 1.55 }}>La aplicación evitó quedarse en negro. Restablece únicamente los datos locales de OverRoll y vuelve a cargar la interfaz.</p>
          <button type="button" onClick={this.resetLocalData} style={{ minHeight: 44, padding: '0 18px', border: '1px solid #ffc43b', color: '#101820', background: '#ffc43b', fontWeight: 900, cursor: 'pointer' }}>RESTABLECER Y RECARGAR</button>
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
