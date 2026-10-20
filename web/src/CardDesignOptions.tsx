import type { CardDesign } from './cardDesign'
import type { SupportedLocale } from './localization'
import { translateUiText } from './uiLocalization'

type Props = { value: CardDesign; onChange: (value: CardDesign) => void; locale: SupportedLocale; asset: (path: string) => string }

export default function CardDesignOptions({ value, onChange, locale, asset }: Props) {
  const tr = (text: string) => translateUiText(locale, text)
  return <div className="card-design-options">
    <h3><img src={asset('assets/game-icons/overwatch.png')} alt="" />Overwatch</h3>
    <div className="card-design-choices">
      {(['classic', 'bars'] as const).map((design) => <label className={`card-design-choice ${value === design ? 'selected' : ''}`} key={design}>
        <input type="radio" name="overwatch-card-design" value={design} checked={value === design} onChange={() => onChange(design)} />
        <span className={`card-design-preview preview-${design}`} aria-hidden="true">
          {['reinhardt', 'tracer', 'mercy'].map((hero) => <span className="card-design-mini" key={hero}><i /><span><img src={asset(`assets/heroes/${hero}.webp`)} alt="" /><b /><b /></span><small /></span>)}
        </span>
        <span className="card-design-caption"><strong>{tr(design === 'classic' ? 'Clásico' : 'Barras')}</strong><span className="card-design-radio" aria-hidden="true" /></span>
      </label>)}
    </div>
  </div>
}
