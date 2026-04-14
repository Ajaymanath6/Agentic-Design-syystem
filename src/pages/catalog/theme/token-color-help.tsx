import type { ReactNode } from 'react'
import type { BrandColorKey } from '../../../config/brand-theme-colors'

/** Optional per-token story for the Theme > Colors help modal (extend for stroke, brand, etc.). */
export type TokenColorHelpEntry = {
  title: string
  body: ReactNode
}

const bodyProseClass = 'space-y-3 text-theme-body-small-regular leading-relaxed text-brandcolor-textweak'

export const TOKEN_COLOR_HELP: Partial<Record<BrandColorKey, TokenColorHelpEntry>> = {
  'brandcolor-textstrong': {
    title: 'Why is it named text-strong?',
    body: (
      <div className={bodyProseClass}>
        <p className="text-brandcolor-textstrong">
          This app is built around <strong className="font-theme-semibold">prompt-to-design</strong>: you
          describe UI in natural language, and what you generate should land on the{' '}
          <strong className="font-theme-semibold">canvas</strong> using the theme tokens you configure on
          this page. Names like <code className="font-mono">text-strong</code> are chosen so you (and
          models) can <strong className="font-theme-semibold">remember and reuse them easily</strong> in
          prompts.
        </p>
        <p>
          Picture a card with a <strong className="text-brandcolor-textstrong">title</strong>, a{' '}
          <strong className="text-brandcolor-textstrong">subtitle</strong>, and a paragraph.{' '}
          <code className="font-mono text-brandcolor-textstrong">text-strong</code> is the color for the
          most important text on the surface—the headline, the primary label, anything that should read
          first.
        </p>
        <p>
          You do not need to spell full utility paths like <code className="font-mono">text-brandcolor-*</code>{' '}
          in prompts. This app ties generation to your <strong className="font-theme-semibold">theme guide</strong>{' '}
          and token names, so short phrases—<code className="font-mono">text-strong</code>,{' '}
          <code className="font-mono">text-weak</code>, or even <code className="font-mono">textstrong</code> /{' '}
          <code className="font-mono">textweak</code>—are enough; matching can map them to the right Tailwind
          classes.
        </p>
        <div>
          <p className="mb-1.5 font-theme-medium text-brandcolor-textstrong">
            Example prompt (card with title, subtitle, paragraph)
          </p>
          <pre className="whitespace-pre-wrap rounded-md border border-brandcolor-strokeweak bg-brandcolor-fill px-3 py-2 font-mono text-[12px] leading-relaxed text-brandcolor-textstrong">
            {`Create a card with white background, stroke weak border, rounded corners and padding. Title as text-strong, subtitle text-weak, paragraph text-weak.`}
          </pre>
        </div>
        <p>
          We deliberately keep the model small: <strong className="font-theme-semibold">two text tiers</strong>{' '}
          (<code className="font-mono">text-strong</code> and{' '}
          <code className="font-mono">text-weak</code>) instead of a long ladder of names. That lowers
          mental overhead and makes prompts like “title in text-strong, subtitle in text-weak” feel
          natural and consistent with your theme.
        </p>
      </div>
    ),
  },
  'brandcolor-textweak': {
    title: 'Why is it named text-weak?',
    body: (
      <div className={bodyProseClass}>
        <p className="text-brandcolor-textstrong">
          <code className="font-mono">text-weak</code> pairs with{' '}
          <code className="font-mono">text-strong</code> for the same prompt-friendly story:{' '}
          <strong className="font-theme-semibold">secondary information</strong> that still matters, but
          should not compete with the main message—so generated UI on the canvas reads with a clear
          hierarchy.
        </p>
        <p>
          In the card example, use <code className="font-mono text-brandcolor-textstrong">text-strong</code>{' '}
          for the title and <code className="font-mono text-brandcolor-textstrong">text-weak</code> for the
          subtitle or supporting line. Body copy can stay on <code className="font-mono">text-weak</code> so
          the layout stays calm while the title keeps focus. (See the full sample prompt in the{' '}
          <strong className="font-theme-semibold">text-strong</strong> help—it spells out subtitle and body
          with <code className="font-mono">text-weak</code>.)
        </p>
        <p>
          Naming it “weak” signals <strong className="font-theme-semibold">lower emphasis</strong>, not bad
          quality—so prompts and handoffs stay short: you only juggle two text colors for hierarchy instead
          of many theoretical grades.
        </p>
      </div>
    ),
  },
}
