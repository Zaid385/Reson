import { BankSelector } from './BankSelector'
import { SaveStatusIndicator } from './SaveStatusIndicator'

export function TopBar() {
  return (
    <header className="h-[56px] flex items-center px-4 bg-bg-surface border-b border-border-subtle shrink-0">
      <h1 className="text-2xl font-semibold tracking-wide">RESON</h1>
      <BankSelector />
      <SaveStatusIndicator />
    </header>
  )
}
