/* eslint-disable @typescript-eslint/no-explicit-any */
export type EngineEventType = 'voice:started' | 'voice:ended' | 'preview:ended'
export type VoiceEventPayload = { voiceId: string; padId: string }
export type PreviewEventPayload = { assetId: string }
export type EventPayload = VoiceEventPayload | PreviewEventPayload

type EventHandler = (payload: any) => void

export class EngineEventEmitter {
  private listeners = new Map<EngineEventType, Set<EventHandler>>()

  on(event: EngineEventType, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)
    return () => {
      this.listeners.get(event)?.delete(handler)
    }
  }

  emit(event: EngineEventType, payload: any) {
    this.listeners.get(event)?.forEach(handler => handler(payload))
  }
}

export const engineEvents = new EngineEventEmitter()
