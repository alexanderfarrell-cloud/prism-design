/** Shared Trimble Financials logo row (Modus / Prism tokens). */

export function LogoMark() {
  return (
    <svg
      className="shrink-0"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      aria-hidden
    >
      <rect x="6" y="6" width="28" height="28" rx="6" className="fill-primary" />
      <path
        fill="white"
        d="M12 12h16v3.5H16.2v4.2H26v3.5H16.2v8.3H12V12z"
      />
    </svg>
  )
}

export function TrimbleLogoRow({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`.trim()}>
      <LogoMark />
      <div className="text-lg leading-tight tracking-tight">
        <span className="font-bold text-primary">Trimble</span>
        <span className="font-normal text-foreground"> Financials</span>
      </div>
    </div>
  )
}
