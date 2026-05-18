import React from 'react'
import { ModusWcIcon } from '@trimble-oss/moduswebcomponents-react'

export default function ReportsHub() {
  return (
    <div className="hub-page">
      <h1 className="hub-title">
        <ModusWcIcon name="bar_chart" size="md" decorative />
        Reports
      </h1>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3rem', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'color-mix(in srgb, var(--modus-wc-color-primary) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ModusWcIcon name="bar_chart" size="lg" decorative style={{ color: 'var(--modus-wc-color-primary)' } as React.CSSProperties} />
        </div>
        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--modus-wc-color-base-content)' }}>Reports coming soon</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--modus-wc-color-base-content-low-contrast)', maxWidth: 360 }}>
          Profit & loss, job cost summaries, and period-end reports will appear here.
        </div>
      </div>
    </div>
  )
}
