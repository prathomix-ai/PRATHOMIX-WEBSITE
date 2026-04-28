import React, { createContext, useContext, useEffect, useState } from 'react'

const THEMES = {
  teal:   { '--accent': '#0a9090', '--accent-light': '#3dcece', '--accent-dark': '#065858' },
  violet: { '--accent': '#7c3aed', '--accent-light': '#a78bfa', '--accent-dark': '#4c1d95' },
  rose:   { '--accent': '#e11d48', '--accent-light': '#fb7185', '--accent-dark': '#9f1239' },
  amber:  { '--accent': '#d97706', '--accent-light': '#fbbf24', '--accent-dark': '#92400e' },
}

const ThemeContext = createContext({ theme: 'teal', setTheme: () => {} })

function getSavedTheme() {
  try { return localStorage.getItem('prathomix_theme') || 'teal' }
  catch { return 'teal' }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getSavedTheme)

  useEffect(() => {
    try {
      const vars = THEMES[theme] || THEMES.teal
      const root = document.documentElement
      Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
      localStorage.setItem('prathomix_theme', theme)
    } catch {}
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeSwitcher() {
  const { theme, setTheme, THEMES } = useTheme()
  return (
    <div className="flex items-center gap-2">
      {Object.entries(THEMES).map(([name, vars]) => (
        <button
          key={name}
          onClick={() => setTheme(name)}
          title={name}
          className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
            theme === name ? 'border-white scale-110' : 'border-transparent hover:scale-105'
          }`}
          style={{ backgroundColor: vars['--accent'] }}
        />
      ))}
    </div>
  )
}
