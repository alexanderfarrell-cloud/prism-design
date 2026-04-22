interface InfoBannerProps {
  children: React.ReactNode
  variant?: 'info' | 'success'
}

export default function InfoBanner({ children, variant = 'info' }: InfoBannerProps) {
  return (
    <div className={`info-banner ${variant}`}>
      <span className="info-banner-icon" aria-hidden="true">
        {variant === 'success' ? '✓' : 'ℹ'}
      </span>
      <span className="info-banner-text">{children}</span>
    </div>
  )
}
