import React from 'react'
import { Search } from 'lucide-react'

interface Props {
  query: string
  setQuery: (q: string) => void
}

export const SampleBrowserSearch: React.FC<Props> = ({ query, setQuery }) => {
  return (
    <div className="relative p-4 border-b border-border-subtle">
      <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search samples..." 
        className="w-full bg-[var(--bg-base)] text-[var(--text-primary)] pl-9 pr-4 py-2 rounded-md text-sm border border-[var(--border-subtle)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors"
      />
    </div>
  )
}
