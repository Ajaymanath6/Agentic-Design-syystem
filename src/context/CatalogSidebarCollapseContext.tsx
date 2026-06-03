import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'catalog-sidebar-collapsed'

type CatalogSidebarCollapseContextValue = {
  collapsed: boolean
  collapse: () => void
  expand: () => void
  toggle: () => void
}

const CatalogSidebarCollapseContext =
  createContext<CatalogSidebarCollapseContextValue | null>(null)

function readStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function persistCollapsed(next: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export function CatalogSidebarCollapseProvider({
  children,
}: {
  children: ReactNode
}) {
  const [collapsed, setCollapsed] = useState(readStoredCollapsed)

  const collapse = useCallback(() => {
    setCollapsed(true)
    persistCollapsed(true)
  }, [])

  const expand = useCallback(() => {
    setCollapsed(false)
    persistCollapsed(false)
  }, [])

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      persistCollapsed(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ collapsed, collapse, expand, toggle }),
    [collapsed, collapse, expand, toggle],
  )

  return (
    <CatalogSidebarCollapseContext.Provider value={value}>
      {children}
    </CatalogSidebarCollapseContext.Provider>
  )
}

export function useCatalogSidebarCollapse(): CatalogSidebarCollapseContextValue {
  const ctx = useContext(CatalogSidebarCollapseContext)
  if (!ctx) {
    throw new Error(
      'useCatalogSidebarCollapse must be used within CatalogSidebarCollapseProvider',
    )
  }
  return ctx
}
