/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react'

export const ThemeToggle: React.FC = () => {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    // Check initial class
    setIsLight(document.documentElement.classList.contains('light'))
  }, [])

  const toggleTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setIsLight(checked)
    if (checked) {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }

  return (
    <label className="theme-switch" title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
      <input 
        type="checkbox" 
        checked={isLight} 
        onChange={toggleTheme}
      />
      <span className="theme-slider"></span>
    </label>
  )
}
