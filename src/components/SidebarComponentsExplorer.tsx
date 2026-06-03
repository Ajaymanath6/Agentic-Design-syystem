import {
  ArrowLeft,
  CaretRight,
  Layout,
  SquaresFour,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { COMPONENT_EXPLORE_ITEMS } from '../config/component-explore-items'
import { useCatalogBlueprintCount } from '../hooks/useCatalogBlueprintCount'
import {
  SidebarDuotoneIcon,
  sidebarNavLabelClass,
} from './SidebarDuotoneIcon'

type ExplorePanel = 'root' | 'components'

const categoryRowClass = (isActive: boolean) =>
  `flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
    isActive
      ? 'bg-brandcolor-strokeweak text-brandcolor-textstrong'
      : 'text-brandcolor-textweak hover:bg-brandcolor-strokeweak'
  }`

/**
 * Explore: Components drills into categories; Layout links to the layouts page (no chevron).
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
            className="flex shrink-0 flex-col gap-2 px-3 pb-1"
          >
            <button
              type="button"
              onClick={() => setPanel('components')}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] font-medium text-brandcolor-textweak transition-colors hover:bg-brandcolor-fill"
            >
              <SidebarDuotoneIcon icon={SquaresFour} active={false} />
              <span className="min-w-0 flex-1 text-brandcolor-textweak">
                Components
              </span>
              <CaretRight
                size={16}
                weight="duotone"
                className="shrink-0 text-brandcolor-textweak"
                aria-hidden
              />
            </button>
            <NavLink to="/catalog/layouts" className="block">
              {({ isActive }) => (
                <span
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] font-medium transition-colors hover:bg-brandcolor-fill ${
                    isActive ? 'bg-brandcolor-fill' : ''
                  }`}
                >
                  <SidebarDuotoneIcon icon={Layout} active={isActive} />
                  <span className={`min-w-0 flex-1 ${sidebarNavLabelClass(isActive)}`}>
                    Layout
                  </span>
                </span>
              )}
            </NavLink>
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-brandcolor-textweak hover:bg-brandcolor-fill"
              aria-label="Back to Explore"
            >
              <ArrowLeft size={20} weight="duotone" aria-hidden />
            </button>
            <span className="text-[13px] font-semibold text-brandcolor-textstrong">
              Components
            </span>
          </div>
          <ul
            role="list"
            aria-label="Component categories"
            className="sidebar-scroll-lean mt-1 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto py-1 pl-3 pr-1"
          >
            <li>
              <NavLink to="/catalog/all" className="block">
                {({ isActive }) => (
                  <span className={categoryRowClass(isActive)}>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      All
                    </span>
                    <span className="shrink-0 font-mono tabular-nums">
                      {allCount === null ? '—' : allCount}
                    </span>
                    <CaretRight
                      size={16}
                      weight="duotone"
                      className={`shrink-0 ${sidebarNavLabelClass(isActive)}`}
                      aria-hidden
                    />
                  </span>
                )}
              </NavLink>
            </li>
            {COMPONENT_EXPLORE_ITEMS.map((item) => {
              const isActive = activeLabel === item.label
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveLabel((cur) =>
                        cur === item.label ? null : item.label,
                      )
                    }
                    className={categoryRowClass(isActive)}
                  >
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <span className="shrink-0 font-mono tabular-nums">
                      {item.count}
                    </span>
                    <CaretRight
                      size={16}
                      weight="duotone"
                      className={`shrink-0 ${sidebarNavLabelClass(isActive)}`}
                      aria-hidden
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}
    </section>
  )
}
