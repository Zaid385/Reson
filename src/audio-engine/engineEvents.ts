export type EngineEventType = 'voice:started' | 'voice:ended'
export type VoiceEventPayload = { voiceId: string; padId: string }

type EventHandler = (payload: VoiceEventPayload) => void

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

  emit(event: EngineEventType, payload: VoiceEventPayload) {
    this.listeners.get(event)?.forEach(handler => handler(payload))
  }
}

export const engineEvents = new EngineEventEmitter()
