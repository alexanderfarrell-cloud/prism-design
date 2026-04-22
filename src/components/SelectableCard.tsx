interface SelectableCardProps {
  id: string
  title: string
  subtitle: string
  detail: string
  selected: boolean
  onClick: () => void
}

export default function SelectableCard({
  id,
  title,
  subtitle,
  detail,
  selected,
  onClick,
}: SelectableCardProps) {
  return (
    <button
      key={id}
      className={`selectable-card${selected ? ' selected' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <div className="selectable-card-body">
        <p className="selectable-card-title">{title}</p>
        <p className="selectable-card-sub">{subtitle}</p>
        <p className="selectable-card-detail">{detail}</p>
      </div>
      {selected && (
        <span className="selectable-card-check" aria-hidden="true">✓</span>
      )}
    </button>
  )
}
