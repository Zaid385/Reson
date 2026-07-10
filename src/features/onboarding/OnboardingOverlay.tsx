import React, { useState, useEffect } from 'react'

const ONBOARDING_KEY = 'reson-has-seen-onboarding'

export const OnboardingOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const hasSeen = localStorage.getItem(ONBOARDING_KEY)
    if (!hasSeen) {
      // Delay slightly to let the app render
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setIsVisible(false)
  }

  const handleNext = () => {
    if (step < 2) {
      setStep(s => s + 1)
    } else {
      handleDismiss()
    }
  }

  if (!isVisible) return null

  const steps = [
    {
      title: 'Welcome to Reson',
      desc: 'Press a key or tap a pad to play. The grid is your instrument.',
      position: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    },
    {
      title: 'Bank Selector',
      desc: 'Switch banks (A, B, C, D) to access 128 different sounds per project.',
      position: 'top-16 left-64'
    },
    {
      title: 'Sample Browser',
      desc: 'Drag your own sounds in here, or use the built-in packs.',
      position: 'top-1/4 left-[300px]'
    }
  ]

  const current = steps[step]

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none">
      <div 
        className={`absolute ${current.position} pointer-events-auto bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xl max-w-sm backdrop-blur-md transition-all duration-300`}
      >
        <h3 className="text-[var(--accent-cyan)] font-semibold mb-2">{current.title}</h3>
        <p className="text-sm text-[var(--text-primary)] mb-4">{current.desc}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-[var(--accent-cyan)]' : 'bg-[var(--border-subtle)]'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            <button 
              className="px-3 py-1 text-xs text-[var(--text-muted)] hover:text-white transition-colors"
              onClick={handleDismiss}
            >
              Skip
            </button>
            <button 
              className="px-4 py-1.5 text-xs bg-[var(--accent-cyan)] text-black font-semibold rounded hover:bg-[var(--accent-cyan-hover)] transition-colors"
              onClick={handleNext}
            >
              {step === steps.length - 1 ? 'Got it' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
