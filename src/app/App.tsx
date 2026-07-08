import { AppProviders } from './AppProviders'
import { AppShell } from './AppShell'
import { ErrorBoundary } from './ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppShell />
      </AppProviders>
    </ErrorBoundary>
  )
}
