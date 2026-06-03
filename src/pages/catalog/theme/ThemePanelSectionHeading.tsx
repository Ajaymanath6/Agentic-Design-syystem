import type { ReactNode } from 'react'

const GEIST_TITLE =
  'font-geist text-[20px] font-semibold leading-tight text-brandcolor-textstrong [font-family:var(--font-geist-stack)]'

const GEIST_SUBTITLE =
  'font-geist text-[14px] leading-snug text-brandcolor-textweak [font-family:var(--font-geist-stack)]'

type ThemePanelSectionHeadingProps = {
  title: string
  subtitle: ReactNode
  id?: string
}

/** Theme editor section title — 20px / 14px Geist, matches home library sections. */
export function ThemePanelSectionHeading({
  title,
  subtitle,
  id,
}: ThemePanelSectionHeadingProps) {
  return (
    <header className="min-w-0">
      <div className="flex flex-col gap-1">
        <h2 id={id} className={GEIST_TITLE}>
          {title}
        </h2>
        <p className={GEIST_SUBTITLE}>{subtitle}</p>
      </div>
    </header>
  )
}
