import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'neutral'

const base =
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-0 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary:
    'text-brandcolor-white !bg-brandcolor-primary hover:!bg-brandcolor-primaryhover active:shadow-button-press',
  neutral:
    'border border-1.5 border-brandcolor-strokestrong bg-brandcolor-white text-brandcolor-textstrong hover:bg-brandcolor-neutralhover active:shadow-border-inset-strokelight',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${className}`.trim()}
      {...props}
    />
  )
}
