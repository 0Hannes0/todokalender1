import { TODO_COLORS } from '../../constants/colors'

export function ColorPicker({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2.5 p-1" role="radiogroup" aria-label="Farbe wählen">
      {TODO_COLORS.map(({ name, hex }) => (
        <button
          key={hex}
          role="radio"
          aria-checked={selected === hex}
          aria-label={name}
          title={name}
          onClick={() => onSelect(hex)}
          className={`w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none ${
            selected === hex ? 'ring-2 ring-offset-2 ring-charcoal/50 scale-110' : ''
          }`}
          style={{ backgroundColor: hex }}
        />
      ))}
    </div>
  )
}
