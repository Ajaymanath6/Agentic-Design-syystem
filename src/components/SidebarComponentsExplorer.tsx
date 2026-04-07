import { useState } from 'react'
import { RiArrowRightSLine, RiLayoutGridLine } from '@remixicon/react'
import { COMPONENT_EXPLORE_ITEMS } from '../config/component-explore-items'

/**
 * Explore → Components header with scrollable category rows (chevron, counts, selection).
 */
export function SidebarComponentsExplorer() {
  const [activeLabel, setActiveLabel] = useState<string | null>(null)

  return (
    <section
      className="mt-1 flex min-h-0 flex-1 flex-col border-t border-brandcolor-strokeweak pt-3"
      aria-labelledby="sidebar-components-heading"
    >
      <div className="shrink-0">
        <p className="px-3 pb-2 text-[13px] font-medium uppercase tracking-wide text-brandcolor-textweak">
          Explore
        </p>
        <div
          id="sidebar-components-heading"
          className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-brandcolor-textstrong"
        >
          <RiLayoutGridLine
            className="size-[18px] shrink-0 text-brandcolor-strokestrong"
            aria-hidden
          />
          <span>Components</span>
        </div>
      </div>
      <ul
        role="list"
        aria-label="Component categories"
        className="sidebar-scroll-lean mt-1 min-h-0 flex-1 overflow-y-auto bg-brandcolor-white py-1 pl-3 pr-1 space-y-0.5"
      >
        {COMPONENT_EXPLORE_ITEMS.map((item) => {
          const isActive = activeLabel === item.label
          const tone = isActive
            ? 'text-brandcolor-textstrong'
            : 'text-brandcolor-textweak'
          return (
            <li key={item.label}>
              <button
                type="button"
                onClick={() =>
                  setActiveLabel((cur) => (cur === item.label ? null : item.label))
                }
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-brandcolor-fill ${
                  isActive ? 'bg-brandcolor-fill' : ''
                } ${tone}`}
              >
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <span className="shrink-0 font-mono tabular-nums">{item.count}</span>
                <RiArrowRightSLine
                  className={`size-4 shrink-0 ${tone}`}
                  aria-hidden
                />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
