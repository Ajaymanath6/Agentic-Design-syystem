import type { HTMLAttributes } from 'react'

export function Card({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white shadow-card ${className}`.trim()}
      {...props}
    />
  )
}
