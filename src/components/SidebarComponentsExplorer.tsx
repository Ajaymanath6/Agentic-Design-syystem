import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  RiArrowLeftLine,
  RiArrowRightSLine,
  RiLayoutGridLine,
  RiLayoutLine,
} from '@remixicon/react'
import { COMPONENT_EXPLORE_ITEMS } from '../config/component-explore-items'
import { useCatalogBlueprintCount } from '../hooks/useCatalogBlueprintCount'

type ExplorePanel = 'root' | 'components' | 'layouts'

const categoryRowClass = (isActive: boolean) =>
  `flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-brandcolor-fill ${
    isActive ? 'bg-brandcolor-fill' : ''
  }`

/**
 * Explore → drill-in: root (Components / Layout) → lists with back.
 */
export function SidebarComponentsExplorer() {
  const [panel, setPanel] = useState<ExplorePanel>('root')
  const [activeLabel, setActiveLabel] = useState<string | null>(null)
  const allCount = useCatalogBlueprintCount()

  return (
    <section
      className="mt-1 flex min-h-0 flex-1 flex-col border-t border-brandcolor-strokeweak pt-3"
      aria-labelledby="sidebar-components-heading"
    >
      <div className="shrink-0">
        <p className="px-3 pb-2 text-[13px] font-medium uppercase tracking-wide text-brandcolor-textweak">
          Explore
        </p>
      </div>

      {panel === 'root' ? (
        <>
          <div
            id="sidebar-components-heading"
            className="flex shrink-0 flex-col gap-0.5 px-3 pb-1"
          >
            <button
              type="button"
              onClick={() => setPanel('components')}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] font-medium text-brandcolor-textstrong transition-colors hover:bg-brandcolor-fill"
            >
              <RiLayoutGridLine
                className="size-[18px] shrink-0 text-brandcolor-strokestrong"
                aria-hidden
              />
              <span className="min-w-0 flex-1">Components</span>
              <RiArrowRightSLine
                className="size-4 shrink-0 text-brandcolor-textweak"
                aria-hidden
              />
            </button>
            <button
              type="button"
              onClick={() => setPanel('layouts')}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] font-medium text-brandcolor-textstrong transition-colors hover:bg-brandcolor-fill"
            >
              <RiLayoutLine
                className="size-[18px] shrink-0 text-brandcolor-strokestrong"
                aria-hidden
              />
              <span className="min-w-0 flex-1">Layout</span>
              <RiArrowRightSLine
                className="size-4 shrink-0 text-brandcolor-textweak"
                aria-hidden
              />
            </button>
          </div>
          <div className="min-h-0 flex-1" aria-hidden />
        </>
      ) : null}

      {panel === 'components' ? (
        <>
          <div className="flex shrink-0 items-center gap-1 px-2 pb-2 pl-3">
            <button
              type="button"
              onClick={() => {
                setPanel('root')
                setActiveLabel(null)
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-brandcolor-textstrong hover:bg-brandcolor-fill"
              aria-label="Back to Explore"
            >
              <RiArrowLeftLine className="size-5" aria-hidden />
            </button>
            <span className="text-[13px] font-semibold text-brandcolor-textstrong">
              Components
            </span>
          </div>
          <ul
            role="list"
            aria-label="Component categories"
            className="sidebar-scroll-lean mt-1 min-h-0 flex-1 overflow-y-auto bg-brandcolor-white py-1 pl-3 pr-1 space-y-0.5"
          >
            <li>
              <NavLink
                to="/catalog/all"
                className={({ isActive }) =>
                  `${categoryRowClass(isActive)} ${
                    isActive
                      ? 'text-brandcolor-textstrong'
                      : 'text-brandcolor-textweak'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      All
                    </span>
                    <span className="shrink-0 font-mono tabular-nums">
                      {allCount === null ? '—' : allCount}
                    </span>
                    <RiArrowRightSLine
                      className={`size-4 shrink-0 ${isActive ? 'text-brandcolor-textstrong' : 'text-brandcolor-textweak'}`}
                      aria-hidden
                    />
                  </>
                )}
              </NavLink>
            </li>
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
                      setActiveLabel((cur) =>
                        cur === item.label ? null : item.label,
                      )
                    }
                    className={`${categoryRowClass(isActive)} ${tone}`}
                  >
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <span className="shrink-0 font-mono tabular-nums">
                      {item.count}
                    </span>
                    <RiArrowRightSLine
                      className={`size-4 shrink-0 ${tone}`}
                      aria-hidden
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}

      {panel === 'layouts' ? (
        <>
          <div className="flex shrink-0 items-center gap-1 px-2 pb-2 pl-3">
            <button
              type="button"
              onClick={() => setPanel('root')}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-brandcolor-textstrong hover:bg-brandcolor-fill"
              aria-label="Back to Explore"
            >
              <RiArrowLeftLine className="size-5" aria-hidden />
            </button>
            <span className="text-[13px] font-semibold text-brandcolor-textstrong">
              Layout
            </span>
          </div>
          <div className="sidebar-scroll-lean mt-1 min-h-0 flex-1 overflow-y-auto px-3 py-2">
            <p className="text-[13px] leading-snug text-brandcolor-textweak">
              No layouts published yet. When ready, open the canvas Layout
              workspace to create and publish pages.
            </p>
            <NavLink
              to="/catalog/layouts"
              className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-brandcolor-primary hover:underline"
            >
              View all layouts
              <RiArrowRightSLine className="size-4" aria-hidden />
            </NavLink>
          </div>
        </>
      ) : null}
    </section>
  )
}
