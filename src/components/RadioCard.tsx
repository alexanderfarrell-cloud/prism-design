interface RadioCardProps {
  id: string
  name: string
  value: string
  checked: boolean
  title: string
  description: string
  onChange: (value: string) => void
}

export default function RadioCard({
  id,
  name,
  value,
  checked,
  title,
  description,
  onChange,
}: RadioCardProps) {
  return (
    <label
      className={`radio-card${checked ? ' selected' : ''}`}
      htmlFor={id}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="radio-card-input"
      />
      <div className="radio-card-content">
        <p className="radio-card-title">{title}</p>
        <p className="radio-card-desc">{description}</p>
      </div>
    </label>
  )
}
