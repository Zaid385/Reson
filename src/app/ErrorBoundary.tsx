import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-bg-base text-accent-pink">
          <div className="p-panel-padding bg-bg-surface-raised rounded-xl">
            <h1 className="text-xl font-bold mb-4">Something went wrong.</h1>
            <pre className="text-sm font-mono text-text-secondary">{this.state.error?.message}</pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
