import type { CardDesign } from './cardDesign'
import type { SupportedLocale } from './localization'
import { translateUiText } from './uiLocalization'

type Props = { value: CardDesign; onChange: (value: CardDesign) => void; locale: SupportedLocale; asset: (path: string) => string }

export default function CardDesignOptions({ value, onChange, locale, asset }: Props) {
  const tr = (text: string) => translateUiText(locale, text)
  return <div className="card-design-options">
    <div className="card-design-choices">
      {(['classic', 'bars'] as const).map((design) => <label className={`card-design-choice ${value === design ? 'selected' : ''}`} key={design}>
        <input type="radio" name="card-design" value={design} checked={value === design} onChange={() => onChange(design)} />
        <span className={`card-design-preview preview-${design}`} aria-hidden="true">
          {['assets/heroes/tracer.webp', 'assets/games/rivals/gorr-the-god-butcher.png', 'assets/tf2/classes/scout.jpg'].map((portrait) => <span className="card-design-mini" key={portrait}><i /><span><img src={asset(portrait)} alt="" /><b /><b /></span><small /></span>)}
        </span>
        <span className="card-design-caption"><strong>{tr(design === 'classic' ? 'Clásico' : 'Barras')}</strong><span className="card-design-radio" aria-hidden="true" /></span>
      </label>)}
    </div>
  </div>
}
