/**
 * The opening crawl, shown once per device after a crew signs in.
 *
 * The prose is owner-supplied and reproduced VERBATIM, including its own
 * capitalisation and punctuation -- the shouted names (VILGAX, ULTIMATE POWER,
 * TEAM TENNYSON, BEN) are the author's emphasis and carry the crawl's voice,
 * so they are not tidied into sentence case.
 *
 * It is split into panels rather than one wall of text for one practical
 * reason: players read this standing in a crowded corridor on a phone, and a
 * tap-to-advance crawl gets read where six paragraphs of scroll does not. The
 * split points are the author's own paragraph breaks.
 *
 * Panel shapes:
 *   'title'  -- the opening card, set large
 *   'crawl'  -- a body beat
 *   'closer' -- the send-off, set large
 */

export const PROLOGUE_TITLE = 'The Hunt Begins'
export const PROLOGUE_EYEBROW = 'Prologue'

export const PROLOGUE_PANELS = [
  {
    id: 'dawn',
    kind: 'title',
    text: 'The Dawn of the universe….',
    subtext: 'A long time ago, In a galaxy Far Far Away',
  },
  {
    id: 'vilgax',
    kind: 'crawl',
    text:
      'It is a period of great peril. The ruthless galactic warlord, VILGAX, has cast a dark ' +
      'shadow across the stars. Seeking to bring the universe to its knees, he has dispatched ' +
      'his sinister pawns to the farthest reaches of space in search of the fragments of the ' +
      'ULTIMATE POWER.',
  },
  {
    id: 'transmissions',
    kind: 'crawl',
    text:
      'But hope is not lost. Desperate transmissions have reached Earth from isolated outposts. ' +
      'Terrified station masters report the sudden appearance of strange, pulsating energy ' +
      'fragments, scattered across the cosmos as if thrown into the void by an ancient force.',
  },
  {
    id: 'stakes',
    kind: 'crawl',
    text: 'Knowing this is the very energy Vilgax will stop at nothing to steal.',
  },
  {
    id: 'tennyson',
    kind: 'crawl',
    text:
      'Racing against time, the brave heroes of TEAM TENNYSON, led by BEN, have been called to ' +
      'action. They must navigate star systems and track down these cosmic shards before Vilgax ' +
      'can claim them, or the galaxy will fall to his eternal terror….',
  },
  {
    id: 'begun',
    kind: 'closer',
    text: 'The stars are waiting. The hunt has begun.',
  },
]

export const PROLOGUE_PANEL_COUNT = PROLOGUE_PANELS.length
