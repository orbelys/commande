import type { TransportEvent } from './types'

/** Petit bus d’événements partagé par les transports. */
export class Emitter {
  private listeners = new Set<(event: TransportEvent) => void>()

  subscribe(listener: (event: TransportEvent) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  emit(event: TransportEvent): void {
    for (const listener of [...this.listeners]) listener(event)
  }

  clear(): void {
    this.listeners.clear()
  }
}
