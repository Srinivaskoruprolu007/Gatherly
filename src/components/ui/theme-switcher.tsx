import useTheme from '#/context/ThemeContext'
import { Moon, Sun } from 'lucide-react'

export const ThemeSwitcher = () => {
  const { setTheme, theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className={`flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium transition hover:border-ring hover:shadow-sm ${
        isDark
          ? 'bg-input text-input-foreground'
          : 'bg-background text-foreground'
      }`}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  )
}
