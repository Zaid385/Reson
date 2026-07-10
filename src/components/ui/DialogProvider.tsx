import React from 'react'
import { useDialogStore } from '@utils/dialog'

export const DialogProvider: React.FC = () => {
  const { isOpen, title, message, confirmText, cancelText, isDanger, isPrompt, promptValue, onPromptChange, onConfirm, onCancel } = useDialogStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-sm bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        <div className="p-6 space-y-4">
          <h2 id="dialog-title" className="text-lg font-bold text-white">{title}</h2>
          <p id="dialog-message" className="text-sm text-[var(--text-muted)] leading-relaxed">
            {message}
          </p>
          {isPrompt && (
            <input
              type="text"
              autoFocus
              className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--accent-cyan)] focus:outline-none rounded-lg px-3 py-2 text-white"
              value={promptValue}
              onChange={(e) => onPromptChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onConfirm()
                if (e.key === 'Escape') onCancel()
              }}
            />
          )}
        </div>
        
        <div className="bg-[var(--bg-surface)] px-6 py-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
          {cancelText && (
            <button 
              className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-[var(--bg-surface-raised)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-subtle)]"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-elevated)] ${
              isDanger 
                ? 'bg-[var(--accent-danger)] text-white hover:opacity-90 focus:ring-[var(--accent-danger)]'
                : 'bg-[var(--accent-cyan)] text-black hover:opacity-90 focus:ring-[var(--accent-cyan)]'
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
