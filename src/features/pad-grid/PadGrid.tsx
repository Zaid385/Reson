import React from 'react'
import { useStore } from '@state/store'
import { Pad } from './Pad'

export const PadGrid: React.FC = () => {
  const activeBankId = useStore(state => state.activeBankId)
  
  if (!activeBankId) return null

  const padIndices = Array.from({ length: 32 }, (_, i) => i)

  return (
    <div className="grid grid-cols-8 gap-2 w-full max-w-[1400px] mx-auto p-8 flex-1 content-center">
      {padIndices.map(index => (
        <Pad key={`${activeBankId}:${index}`} bankId={activeBankId} slotIndex={index} />
      ))}
    </div>
  )
}
