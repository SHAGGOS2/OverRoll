import { createPortal } from 'react-dom'
import { useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import './ViewportAction.css'

type Props = {
  className?: string
  style?: CSSProperties
  children: ReactNode
}

const mobileQuery = '(max-width: 620px)'
function subscribe(listener: () => void) {
  const media = window.matchMedia(mobileQuery)
  media.addEventListener('change', listener)
  return () => media.removeEventListener('change', listener)
}
export default function ViewportAction({ className = '', style, children }: Props) {
  const mobile = useSyncExternalStore(subscribe, () => window.matchMedia(mobileQuery).matches, () => false)
  const action = <div className={`team-generate-action ${className}`.trim()} style={style}>{children}</div>
  return mobile && typeof document !== 'undefined' ? createPortal(action, document.body) : action
}
