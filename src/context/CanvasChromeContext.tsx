import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type CanvasChromeContextValue = {
  blockCount: number
  setBlockCount: (n: number) => void
}

const CanvasChromeContext = createContext<CanvasChromeContextValue | null>(null)

export function CanvasChromeProvider({ children }: { children: ReactNode }) {
  const [blockCount, setBlockCountState] = useState(0)
  const setBlockCount = useCallback((n: number) => {
    setBlockCountState(n)
  }, [])

  const value = useMemo<CanvasChromeContextValue>(
    () => ({ blockCount, setBlockCount }),
    [blockCount, setBlockCount],
  )

  return (
    <CanvasChromeContext.Provider value={value}>
      {children}
    </CanvasChromeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useCanvasChrome(): CanvasChromeContextValue {
  const ctx = useContext(CanvasChromeContext)
  if (!ctx) {
    throw new Error('useCanvasChrome must be used within CanvasChromeProvider')
  }
  return ctx
}
