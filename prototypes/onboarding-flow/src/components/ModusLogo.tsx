import { ModusWcLogo } from '@trimble-oss/moduswebcomponents-react'

export type LogoName =
  | 'trimble'
  | 'siteworks'
  | 'earthworks'
  | 'financials'
  | 'worksmanager'
  | 'connect'
  | 'unity_construct'
  | 'trade_servicelive'
  | 'buildable'
  | 'livecount'
  | 'supplier_xchange'
  | 'app_xchange'
  | 'trimble_unity'
  | 'sketchup'
  | 'pc_miler'
  | 'copilot'
  | 'trimble_pay'
  | 'projectsight'
  | 'demand_planning'
  | 'viewpoint'
  | 'viewpoint_analytics'
  | 'viewpoint_epayments'
  | 'viewpoint_estimating'
  | 'viewpoint_field_management'
  | 'viewpoint_field_time'
  | 'viewpoint_financial_controls'
  | 'viewpoint_hr_management'
  | 'viewpoint_jobpac_connect'
  | 'viewpoint_procontractor'
  | 'viewpoint_spectrum'
  | 'viewpoint_team'
  | 'viewpoint_vista'
  | 'viewpoint_spectrum_service_tech'
  | 'viewpoint_for_projects'
  | 'viewpoint_vista_field_service'
  | 'viewpoint_field_view'

export interface ModusLogoProps {
  name: LogoName
  emblem?: boolean
  customClass?: string
  alt?: string
}

export default function ModusLogo({
  name,
  emblem = false,
  customClass,
  alt,
}: ModusLogoProps) {
  return (
    <ModusWcLogo
      name={name}
      emblem={emblem}
      custom-class={customClass}
      alt={alt}
    />
  )
}
