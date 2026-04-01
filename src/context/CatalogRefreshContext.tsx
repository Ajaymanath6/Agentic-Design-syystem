import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type CatalogRefreshContextValue = {
  catalogVersion: number
  refreshCatalog: () => void
}

const CatalogRefreshContext = createContext<CatalogRefreshContextValue | null>(
  null,
)

export function CatalogRefreshProvider({ children }: { children: ReactNode }) {
  const [catalogVersion, setCatalogVersion] = useState(0)
  const refreshCatalog = useCallback(() => {
    setCatalogVersion((v) => v + 1)
  }, [])
  const value = useMemo(
    () => ({ catalogVersion, refreshCatalog }),
    [catalogVersion, refreshCatalog],
  )
  return (
    <CatalogRefreshContext.Provider value={value}>
      {children}
    </CatalogRefreshContext.Provider>
  )
}

/** Hook lives with provider; Fast Refresh allows both in practice. */
// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useCatalogRefresh() {
  const ctx = useContext(CatalogRefreshContext)
  if (!ctx) {
    throw new Error('useCatalogRefresh must be used within CatalogRefreshProvider')
  }
  return ctx
}
