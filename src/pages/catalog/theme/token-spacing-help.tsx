import type { ReactNode } from 'react'

import type { SpacingTokenKey } from '../../../config/theme-spacing-defaults'
import { SPACING_DEFAULTS } from '../../../config/theme-spacing-defaults'
import {
  approxSpacingDisplayLabel,
  exampleTailwindForToken,
} from '../../../lib/theme-spacing-display'

export type TokenSpacingHelpEntry = {
  title: string
  body: ReactNode
}

const bodyProseClass =
  'space-y-3 text-theme-body-small-regular leading-relaxed text-brandcolor-textweak'

function defaultValueHint(key: SpacingTokenKey): string {
  const raw = SPACING_DEFAULTS[key]
  const approx = approxSpacingDisplayLabel(raw)
  return approx ? `Shipped default ${raw} → ${approx}.` : `Shipped default ${raw}.`
}

export const TOKEN_SPACING_HELP: Record<SpacingTokenKey, TokenSpacingHelpEntry> = {
  micro: {
    title: 'Why is it named micro?',
    body: (
      <div className={bodyProseClass}>
        <p className="text-brandcolor-textstrong">
          <strong className="font-theme-semibold">Micro</strong> is the smallest named step: hairline
          gaps between an icon and its label, badge innards, or two chips that should feel almost
          touching. Say it in prompts when you want density without arbitrary pixel math.
        </p>
        <p>{defaultValueHint('micro')}</p>
        <p>
          <strong className="font-theme-semibold">Figma bridge:</strong> roughly XXS / 4px-scale inner
          rhythm—think “tighten until it almost clips.”
        </p>
        <div>
          <p className="mb-1.5 font-theme-medium text-brandcolor-textstrong">Prompt phrases</p>
          <ul className="list-inside list-disc space-y-1">
            <li>“micro gap between icon and text”</li>
            <li>“hairline padding inside a chip”</li>
            <li>“densest inner spacing”</li>
          </ul>
        </div>
        <p>
          <strong className="font-theme-semibold">Tailwind:</strong>{' '}
          <code className="font-mono text-brandcolor-textstrong">
            {exampleTailwindForToken('micro')}
          </code>
        </p>
      </div>
    ),
  },
  tight: {
    title: 'Why is it named tight?',
    body: (
      <div className={bodyProseClass}>
        <p className="text-brandcolor-textstrong">
          <strong className="font-theme-semibold">Tight</strong> keeps related lines inside one
          component—title + meta, stacked labels, or a compact form group—without the roominess of{' '}
          <code className="font-mono">cozy</code>. Inside → out: use tight <em>inside</em> the card;
          use <code className="font-mono">cozy</code> for the card shell.
        </p>
        <p>{defaultValueHint('tight')}</p>
        <p>
          <strong className="font-theme-semibold">Figma bridge:</strong> XS-scale vertical stack
          inside a component frame.
        </p>
        <div>
          <p className="mb-1.5 font-theme-medium text-brandcolor-textstrong">Prompt phrases</p>
          <ul className="list-inside list-disc space-y-1">
            <li>“tight stack under the title”</li>
            <li>“dense vertical gap between related lines”</li>
            <li>“compact spacing inside the card body”</li>
          </ul>
        </div>
        <p>
          <strong className="font-theme-semibold">Tailwind:</strong>{' '}
          <code className="font-mono text-brandcolor-textstrong">
            {exampleTailwindForToken('tight')}
          </code>
        </p>
      </div>
    ),
  },
  cozy: {
    title: 'Why is it named cozy?',
    body: (
      <div className={bodyProseClass}>
        <p className="text-brandcolor-textstrong">
          <strong className="font-theme-semibold">Cozy</strong> is the default “comfortable” shell:
          inner padding on cards, panels, and dialogs, plus vertical gaps between sibling blocks that
          belong together. When you say “card padding” without a number, this is the token to land on.
        </p>
        <p>{defaultValueHint('cozy')}</p>
        <p>
          <strong className="font-theme-semibold">Figma bridge:</strong> S-scale padding on a card
          frame; the token name reads warmer than “medium.”
        </p>
        <div>
          <p className="mb-1.5 font-theme-medium text-brandcolor-textstrong">Prompt phrases</p>
          <ul className="list-inside list-disc space-y-1">
            <li>“cozy padding on the card”</li>
            <li>“default inner padding and gap-cozy between rows”</li>
            <li>“comfortable stack spacing inside the panel”</li>
          </ul>
        </div>
        <p>
          <strong className="font-theme-semibold">Tailwind:</strong>{' '}
          <code className="font-mono text-brandcolor-textstrong">
            {exampleTailwindForToken('cozy')}
          </code>
        </p>
      </div>
    ),
  },
  section: {
    title: 'Why is it named section?',
    body: (
      <div className={bodyProseClass}>
        <p className="text-brandcolor-textstrong">
          <strong className="font-theme-semibold">Section</strong> signals a break between major
          groups: form sections, “above the fold” vs body, or space before a new heading block. It
          sits between cozy inner rhythm and hero-scale drama.
        </p>
        <p>{defaultValueHint('section')}</p>
        <p>
          <strong className="font-theme-semibold">Figma bridge:</strong> M / L gap between frames on
          the page, not inside a single card.
        </p>
        <div>
          <p className="mb-1.5 font-theme-medium text-brandcolor-textstrong">Prompt phrases</p>
          <ul className="list-inside list-disc space-y-1">
            <li>“section gap before the next group”</li>
            <li>“margin between two major blocks”</li>
            <li>“space between form sections”</li>
          </ul>
        </div>
        <p>
          <strong className="font-theme-semibold">Tailwind:</strong>{' '}
          <code className="font-mono text-brandcolor-textstrong">
            {exampleTailwindForToken('section')}
          </code>
        </p>
      </div>
    ),
  },
  hero: {
    title: 'Why is it named hero?',
    body: (
      <div className={bodyProseClass}>
        <p className="text-brandcolor-textstrong">
          <strong className="font-theme-semibold">Hero</strong> is the largest named vertical step:
          after a hero title, before primary content, or between very distinct page chapters. Use
          sparingly so it keeps impact.
        </p>
        <p>{defaultValueHint('hero')}</p>
        <p>
          <strong className="font-theme-semibold">Figma bridge:</strong> XL vertical gap—page-level
          breathing room, not inside a dense form.
        </p>
        <div>
          <p className="mb-1.5 font-theme-medium text-brandcolor-textstrong">Prompt phrases</p>
          <ul className="list-inside list-disc space-y-1">
            <li>“hero spacing below the headline”</li>
            <li>“large break before the first card”</li>
            <li>“big vertical gap between page chapters”</li>
          </ul>
        </div>
        <p>
          <strong className="font-theme-semibold">Tailwind:</strong>{' '}
          <code className="font-mono text-brandcolor-textstrong">
            {exampleTailwindForToken('hero')}
          </code>
        </p>
      </div>
    ),
  },
  inline: {
    title: 'Why is it named inline?',
    body: (
      <div className={bodyProseClass}>
        <p className="text-brandcolor-textstrong">
          <strong className="font-theme-semibold">Inline</strong> is tuned for horizontal rows:
          button groups, filters, label + control pairs, or chip trails. It is intentionally distinct
          from vertical stack tokens so prompts can say “inline gap” without ambiguity.
        </p>
        <p>{defaultValueHint('inline')}</p>
        <p>
          <strong className="font-theme-semibold">Figma bridge:</strong> horizontal auto-layout gap
          between siblings in a row—often between S and M in pixel feel.
        </p>
        <div>
          <p className="mb-1.5 font-theme-medium text-brandcolor-textstrong">Prompt phrases</p>
          <ul className="list-inside list-disc space-y-1">
            <li>“inline gap between the buttons”</li>
            <li>“horizontal spacing in the toolbar”</li>
            <li>“space-x-inline for the chip row”</li>
          </ul>
        </div>
        <p>
          <strong className="font-theme-semibold">Tailwind:</strong>{' '}
          <code className="font-mono text-brandcolor-textstrong">
            {exampleTailwindForToken('inline')}
          </code>
        </p>
      </div>
    ),
  },
}
