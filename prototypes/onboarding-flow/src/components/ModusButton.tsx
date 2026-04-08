import { ModusWcButton } from '@trimble-oss/moduswebcomponents-react'
import type { ReactNode } from 'react'

interface ModusButtonProps {
  color?: 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger'
  variant?: 'filled' | 'outlined' | 'borderless'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  shape?: 'rectangle' | 'square' | 'circle'
  disabled?: boolean
  fullWidth?: boolean
  pressed?: boolean
  type?: 'button' | 'submit' | 'reset'
  children?: ReactNode
  icon?: string
  iconPosition?: 'left' | 'right' | 'only'
  iconSize?: string
  ariaLabel?: string
  onButtonClick?: () => void
  className?: string
}

export default function ModusButton({
  color,
  variant,
  size = 'md',
  shape = 'rectangle',
  disabled = false,
  fullWidth = false,
  pressed = false,
  type = 'button',
  children,
  icon,
  iconPosition = 'left',
  iconSize,
  ariaLabel,
  onButtonClick,
  className,
}: ModusButtonProps) {
  const getIconSizeClass = (): string => {
    if (iconSize) return iconSize
    if (iconPosition === 'only') {
      switch (size) {
        case 'xs':
          return 'text-sm'
        case 'sm':
          return 'text-base'
        case 'md':
          return 'text-xl'
        case 'lg':
          return 'text-2xl'
        default:
          return 'text-xl'
      }
    }
    switch (size) {
      case 'xs':
        return 'text-xs'
      case 'sm':
        return 'text-sm'
      case 'md':
        return 'text-lg'
      case 'lg':
        return 'text-xl'
      default:
        return 'text-lg'
    }
  }

  const renderIcon = (iconName: string, position: 'left' | 'right' | 'only') => {
    const iconStyle =
      position === 'left'
        ? { marginRight: '8px' }
        : position === 'right'
          ? { marginLeft: '8px' }
          : {}
    return (
      <i className={`modus-icons ${getIconSizeClass()}`} style={iconStyle}>
        {iconName}
      </i>
    )
  }

  const renderContent = () => {
    if (!icon) return children
    switch (iconPosition) {
      case 'left':
        return (
          <>
            {renderIcon(icon, 'left')}
            {children}
          </>
        )
      case 'right':
        return (
          <>
            {children}
            {renderIcon(icon, 'right')}
          </>
        )
      case 'only':
        return renderIcon(icon, 'only')
      default:
        return children
    }
  }

  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel
    if (iconPosition === 'only' && typeof children === 'string') return children
    return undefined
  }

  return (
    <ModusWcButton
      {...(color && { color })}
      {...(variant && { variant })}
      size={size}
      shape={shape}
      disabled={disabled}
      fullWidth={fullWidth}
      pressed={pressed}
      type={type}
      aria-label={getAriaLabel()}
      onButtonClick={onButtonClick}
      custom-class={className}
    >
      <div className="contents">{renderContent()}</div>
    </ModusWcButton>
  )
}
