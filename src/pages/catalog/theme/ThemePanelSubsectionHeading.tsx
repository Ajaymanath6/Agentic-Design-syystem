import type { ReactNode } from 'react'

const GEIST_SUBSECTION_TITLE =
  'font-geist text-[16px] font-semibold leading-tight text-brandcolor-textstrong [font-family:var(--font-geist-stack)]'

const GEIST_SUBSECTION_SUBTITLE =
  'font-geist text-[14px] leading-snug text-brandcolor-textweak [font-family:var(--font-geist-stack)]'

type ThemePanelSubsectionHeadingProps = {
  title: string
  subtitle?: ReactNode
  id?: string
  as?: 'h3' | 'h4'
  className?: string
  dividerTop?: boolean
}

/** Theme editor group title — 16px / 14px Geist (e.g. Text colors + description). */
export function ThemePanelSubsectionHeading({
  title,
  subtitle,
  id,
  as: Tag = 'h3',
  className = '',
  dividerTop = false,
}: ThemePanelSubsectionHeadingProps) {
  const dividerClass = dividerTop
    ? 'border-t border-brandcolor-strokeweak pt-8'
    : ''

  return (
    <header className={`min-w-0 ${className}`.trim()}>
      <Tag id={id} className={`${GEIST_SUBSECTION_TITLE} ${dividerClass}`.trim()}>
        {title}
      </Tag>
      {subtitle ? <p className={`mt-1 ${GEIST_SUBSECTION_SUBTITLE}`}>{subtitle}</p> : null}
    </header>
  )
}
