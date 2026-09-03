import { createPortal } from 'react-dom'
import type { CSSProperties, ReactNode } from 'react'

type Props = {
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export default function ViewportAction({ className = '', style, children }: Props) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <div className={`principal-generate-dock ${className}`.trim()} style={style}>
      {children}
    </div>,
    document.body,
  )
}
