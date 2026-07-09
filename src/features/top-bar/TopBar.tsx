import { BankSelector } from './BankSelector'
import { SaveStatusIndicator } from './SaveStatusIndicator'
import { MasterVolumeControl } from './MasterVolumeControl'

export function TopBar() {
  return (
    <header className="h-[56px] flex items-center justify-between px-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shrink-0">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-semibold tracking-wide text-[var(--accent-cyan)]">RESON</h1>
        <BankSelector />
        <SaveStatusIndicator />
      </div>
      <div className="flex items-center h-full">
        <MasterVolumeControl />
      </div>
    </header>
  )
}
