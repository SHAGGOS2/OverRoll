import type { CardDesign } from './cardDesign'
import type { SupportedLocale } from './localization'
import { translateUiText } from './uiLocalization'
import { tf2Artwork } from './tf2Artwork'

type Props = { value: CardDesign; onChange: (value: CardDesign) => void; locale: SupportedLocale; asset: (path: string) => string }

export default function CardDesignOptions({ value, onChange, locale, asset }: Props) {
  const tr = (text: string) => translateUiText(locale, text)
  const scout = tf2Artwork['tf2-scout']
  return <div className="card-design-options">
    <div className="card-design-choices">
      {(['classic', 'bars', 'horizontal', 'orbit', 'hex'] as const).map((design) => <label className={`card-design-choice ${value === design ? 'selected' : ''}`} key={design}>
        <input type="radio" name="card-design" value={design} checked={value === design} onChange={() => onChange(design)} />
        <span className={`card-design-preview preview-${design}`} aria-hidden="true">
          {['assets/heroes/tracer.webp', 'assets/games/rivals/gorr-the-god-butcher.png', 'assets/tf2/classes/scout.jpg'].map((portrait, index) => <span className="card-design-mini" key={portrait}><i /><span>{index === 2 && design !== 'classic' ? <svg className="card-design-art" viewBox={`${scout.frame.x} ${scout.frame.y} ${scout.frame.width} ${scout.frame.height}`} preserveAspectRatio="xMidYMid meet"><image href={asset(scout.portrait)} width={scout.frame.sourceWidth} height={scout.frame.sourceHeight} /></svg> : <img className="card-design-art" src={asset(portrait)} alt="" />}<b /><b /></span><small /></span>)}
        </span>
        <span className="card-design-caption"><strong>{tr(design === 'classic' ? 'Clásico' : design === 'bars' ? 'Barras' : design === 'horizontal' ? 'Horizontal' : design === 'orbit' ? 'Órbita' : 'Hexágonos')}</strong><span className="card-design-radio" aria-hidden="true" /></span>
      </label>)}
    </div>
  </div>
}
