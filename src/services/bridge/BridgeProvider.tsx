import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createCommand } from './commands'
import { createTransport, transportParDefaut, type TransportKind } from './createTransport'
import { BridgeContext, type BridgeValue } from './BridgeContext'
import type { CommandPayload, CommandType, Command, ConnectionStatus, Snapshot, Transport } from './types'

const MAX_HISTORIQUE = 60

/**
 * Point unique de contact avec Electron.
 * Toute l'application lit l’état ici et envoie ses commandes ici.
 */
export function BridgeProvider({ children }: { children: ReactNode }) {
  const [kind] = useState<TransportKind>(transportParDefaut)
  const [status, setStatus] = useState<ConnectionStatus>('offline')
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [commandes, setCommandes] = useState<Command[]>([])
  const transportRef = useRef<Transport | null>(null)

  if (transportRef.current === null) {
    transportRef.current = createTransport(kind)
  }

  useEffect(() => {
    const transport = transportRef.current
    if (!transport) return
    const off = transport.subscribe((event) => {
      switch (event.type) {
        case 'status':
          setStatus(event.status)
          break
        case 'snapshot':
          setSnapshot(event.snapshot)
          break
        case 'command':
          setCommandes((liste) =>
            liste.map((c) =>
              c.id === event.id ? { ...c, statut: event.statut, erreur: event.erreur } : c,
            ),
          )
          break
      }
    })
    transport.connect()
    return () => {
      off()
      transport.disconnect()
    }
  }, [])

  const connecter = useCallback(() => transportRef.current?.connect(), [])
  const deconnecter = useCallback(() => transportRef.current?.disconnect(), [])
  const viderHistorique = useCallback(() => setCommandes([]), [])

  const envoyer = useCallback((type: CommandType, payload: CommandPayload = {}) => {
    const commande = createCommand(type, payload)
    setCommandes((liste) => [commande, ...liste].slice(0, MAX_HISTORIQUE))
    void transportRef.current?.send(commande)
    return commande
  }, [])

  const value = useMemo<BridgeValue>(
    () => ({
      status,
      transportId: kind,
      transportLibelle: transportRef.current?.libelle ?? '',
      snapshot,
      commandes,
      connecter,
      deconnecter,
      envoyer,
      viderHistorique,
    }),
    [status, kind, snapshot, commandes, connecter, deconnecter, envoyer, viderHistorique],
  )

  return <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>
}
