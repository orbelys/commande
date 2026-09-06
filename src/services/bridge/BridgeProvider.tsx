import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createCommand } from './commands'
import { createTransport, transportParDefaut, type TransportKind } from './createTransport'
import { BridgeContext, type BridgeValue } from './BridgeContext'
import type {
  Command,
  CommandPayload,
  CommandType,
  ConnectionStatus,
  Session,
  Snapshot,
  Transport,
} from './types'

const MAX_HISTORIQUE = 60

/**
 * Point unique de contact avec la Suite PSE.
 * Toute l'application lit l'état ici et envoie ses commandes ici.
 */
export function BridgeProvider({ children }: { children: ReactNode }) {
  const [kind] = useState<TransportKind>(transportParDefaut)
  const [status, setStatus] = useState<ConnectionStatus>('offline')
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [commandes, setCommandes] = useState<Command[]>([])
  const [erreur, setErreur] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)
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
          setSession(transport.session?.() ?? null)
          if (event.status === 'online') setErreur(null)
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
        case 'erreur':
          setErreur(event.message)
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

  const seConnecter = useCallback(async (email: string, motDePasse: string) => {
    const t = transportRef.current
    if (!t?.seConnecter) throw new Error('Ce transport ne demande pas d’identifiants.')
    setErreur(null)
    await t.seConnecter(email, motDePasse)
    setSession(t.session?.() ?? null)
  }, [])

  const seDeconnecter = useCallback(async () => {
    const t = transportRef.current
    await t?.seDeconnecter?.()
    setSession(null)
    setSnapshot(null)
  }, [])

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
      authRequise: transportRef.current?.authRequise ?? false,
      session,
      snapshot,
      commandes,
      erreur,
      connecter,
      deconnecter,
      seConnecter,
      seDeconnecter,
      envoyer,
      viderHistorique,
    }),
    [
      status,
      kind,
      session,
      snapshot,
      commandes,
      erreur,
      connecter,
      deconnecter,
      seConnecter,
      seDeconnecter,
      envoyer,
      viderHistorique,
    ],
  )

  return <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>
}
