import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'app-theme'

export type ThemeId = 'light' | 'dark'

export interface Theme {
  id: ThemeId
  name: string
}

export const Themes: Theme[] = [
  { id: 'light', name: '☀️ Light' },
  { id: 'dark', name: '🌙 Dark' },
]
interface ThemeContextValue {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
  themes: Theme[]
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const applyTheme = (theme: ThemeId): void => {
  const root = document.documentElement
  root.classList.remove('dark')
  if (theme === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.style.colorScheme = 'light'
  }
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: ThemeId
}

export const ThemeProvider = ({
  children,
  defaultTheme = 'light',
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem(STORAGE_KEY) as ThemeId | null
      return storedTheme ?? defaultTheme
    }
    return defaultTheme
  })

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: Themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
