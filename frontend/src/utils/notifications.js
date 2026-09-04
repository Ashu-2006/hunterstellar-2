/**
 * Turns a team-state payload into the list the notification bell renders.
 *
 * Lives outside the component file so the bell exports only a component --
 * a mixed module breaks Vite's fast refresh, which is a real cost when
 * iterating on this at an event.
 */

/** Stable id from the content, so "seen" survives reloads and re-polls. */
function idFor(kind, message) {
  let hash = 0
  for (let i = 0; i < message.length; i++) {
    hash = (hash * 31 + message.charCodeAt(i)) | 0
  }
  return `${kind}:${hash}`
}

/** Builds the notification list from a team-state payload. */
export function notificationsFromState(state) {
  const items = []
  if (state?.announcement) {
    items.push({
      id: idFor('announcement', state.announcement),
      kind: 'announcement',
      label: 'Base broadcast',
      message: state.announcement,
    })
  }
  if (state?.notice) {
    items.push({
      id: idFor('notice', state.notice),
      kind: 'notice',
      label: 'Crew notice',
      message: state.notice,
    })
  }
  return items
}
