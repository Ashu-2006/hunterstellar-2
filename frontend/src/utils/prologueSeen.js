/**
 * Tracks which crews have already been through the opening briefing.
 *
 * Keyed by team id, and deliberately NOT cleared on logout: four teammates
 * share one login, but each is on their own phone, so "has this device seen
 * it" is the right unit. A captain who logs out and back in mid-hunt should
 * land on their clue, not sit through the briefing again -- while a teammate
 * joining on a fresh phone still gets it.
 *
 * Every read and write is guarded: private-mode Safari throws on access, and
 * a briefing is never worth failing a login over. When storage is unusable we
 * report "not seen", so the worst case is a re-read, never a lost clue.
 */

const KEY_PREFIX = 'hunterstellar_prologue_seen:'

function keyFor(teamId) {
  return `${KEY_PREFIX}${teamId ?? 'anon'}`
}

export function hasSeenPrologue(teamId) {
  try {
    return localStorage.getItem(keyFor(teamId)) === '1'
  } catch {
    return false
  }
}

export function markPrologueSeen(teamId) {
  try {
    localStorage.setItem(keyFor(teamId), '1')
  } catch {
    /* ignore -- they will simply see it again next time */
  }
}
