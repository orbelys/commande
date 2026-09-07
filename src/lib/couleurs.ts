/**
 * Couleur stable par classe ou par intitulé.
 *
 * Le même libellé donne toujours la même teinte, d'une séance à l'autre et
 * d'un jour à l'autre : c'est ce qui permet de reconnaître une classe d'un
 * coup d'œil dans la frise, sans lire.
 *
 * On ne tire que la teinte : la saturation et la clarté restent maîtrisées,
 * pour que tout reste lisible et cohérent, en clair comme en sombre.
 */

/** Douze teintes bien réparties, en évitant les jaunes illisibles. */
const TEINTES = [214, 262, 292, 330, 350, 12, 32, 152, 172, 190, 240, 276]

function empreinte(texte: string): number {
  let h = 0
  const s = String(texte || '').trim().toLowerCase()
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export interface Teinte {
  /** Trait vertical et pastille. */
  vif: string
  /** Fond très pâle, pour un chip ou une ligne. */
  fond: string
  /** Texte lisible sur ce fond. */
  texte: string
}

export function couleurDe(libelle: string): Teinte {
  const h = TEINTES[empreinte(libelle) % TEINTES.length]
  return {
    vif: `hsl(${h} 72% 52%)`,
    fond: `hsl(${h} 78% 96%)`,
    texte: `hsl(${h} 62% 32%)`,
  }
}

/**
 * Extrait la classe d'un intitulé Pronote :
 * « PREVENT.-SANTE-ENV. - C2PSR » → « C2PSR ».
 * C'est cette partie qui doit porter la couleur, pas la matière.
 */
export function classeDepuisTitre(titre: string): string {
  const t = String(titre || '')
  const morceaux = t.split(' - ')
  const dernier = morceaux[morceaux.length - 1].trim()
  if (morceaux.length > 1 && dernier.length <= 12) return dernier
  return t
}
