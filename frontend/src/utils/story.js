// Hunterstellar 2.0 — static story lore (frontend only).
// Base: Rust Bucket. The Null Void is tearing spacetime apart (Vacuum Decay).
// Plan: recover 4 data fragments from stations orbiting the Void, then fire the
// tachyon pulse from inside it. Progress 0 = at base; names are revealed only
// as teams arrive at each station.

export const STORY = {
  // The base briefing — Commander ONLY at Rust Bucket (progress 0). No robot,
  // and only the FIRST station is named as the opening clue.
  baseBriefing: {
    character: 'Commander',
    location: 'Base Station · Rust Bucket',
    avatar: 'commander',
    cta: 'Board the shuttle',
    lines: [
      'The cluster is dying and it will not wait. The Null Void is tearing spacetime apart from ' +
        'the inside. There is one cure — the tachyon pulse.',
      'Its targeting data lived in four data centers orbiting that black hole, and a gamma burst ' +
        'just wiped them all. Along with every record of how to reach them — I could not save any of it.',
      'All that survives is one stone. Before the data fell, I carved the first bearing into a rock ' +
        'outside this station with my own hands.',
      'It points to CARINA — the high-orbit data center over the Void. Reach it. Solve what its ' +
        'computer demands, and it will hand you the fragment and the next bearing.',
      'Each of those centers guards one fragment of the pulse’s aim. Recover all four and we fire ' +
        'into the Void’s heart and end this. Now get in the shuttle, captain.',
    ],
    sendoff: 'Good luck out there. The cluster is counting on you.',
  },

  // The MC’s only line — after all four fragments, just before crossing the Void.
  mcFinal: {
    character: 'You',
    avatar: 'mc',
    lines: [
      'Yes, captain. We have them all. The pulse is ready — point us at the Void and let’s end this.',
    ],
    cta: 'Into the Null Void',
  },

  // Travel copy
  travel: {
    titles: ['Course plotted', 'Crossing the dark', 'Closing in', 'Docking sequence'],
  },
}

// Per-station data. Only the current/last reached station ever reveals its name.
// robot.* drives which distinct robot variant and voice you hear.
const STATIONS = {
  0: {
    name: 'Carina',
    descriptor: 'high-orbit data center',
    kind: 'fragment',
    fragment: 'Fragment I',
    robot: {
      avatar: 'robot-carina',
      label: 'Carina Relay',
    },
    // Robot arrival welcome — reveals the station name for the first time.
    arrival:
      'Beacon acquired. You have reached CARINA — the high-orbit data center over the Void, marked ' +
      'by the Commander’s stone. Confirm your course, then key in the station code.',
    // Robot before the puzzle.
    reveal:
      'Access granted. I still hold the oldest raw scans of the black hole — and the keeper left a ' +
      'single lock for any worthy crew. Answer it, and I release Fragment I.',
    // Robot after solving — next clue.
    gained:
      'Fragment I secured. With the scan thread, I can relay a new bearing — a deep-space relay ' +
      'where the pulse was first modelled. Plot the course to VERRA.',
  },
  1: {
    name: 'Verra',
    descriptor: 'deep-space relay',
    kind: 'fragment',
    fragment: 'Fragment II',
    robot: {
      avatar: 'robot-verra',
      label: 'Verra Node',
    },
    arrival:
      'Beacon acquired. You have reached VERRA — the deep-space relay where the pulse was first ' +
      'planned. Key in the station code to board.',
    reveal:
      'Access granted. My archives hold the original calculations — and one anomaly nobody could ' +
      'explain. Solve what I demand, and Fragment II is yours.',
    gained:
      'Fragment II extracted. The calculations resolve now. My optics see the next point: a world ' +
      'that never faces its star. Plot the course to NYX.',
  },
  2: {
    name: 'Nyx',
    descriptor: 'dark-side observatory',
    kind: 'fragment',
    fragment: 'Fragment III',
    robot: {
      avatar: 'robot-nyx',
      label: 'Nyx Sentry',
    },
    arrival:
      'Beacon acquired. You have reached NYX — the observatory in permanent shadow, the only one ' +
      'that saw the burst begin. Key in the station code to wake me.',
    reveal:
      'Access granted. My optics caught the exact moment the burst began. Guarding that image is ' +
      'a challenge you must pass. Pass it, and Fragment III is freed.',
    gained:
      'Fragment III secured. I can render the final lane — the inner station, closest above the ' +
      'Void. Plot the course to SOLUNE.',
  },
  3: {
    name: 'Solune',
    descriptor: 'inner-rim station',
    kind: 'fragment',
    fragment: 'Fragment IV',
    robot: {
      avatar: 'robot-solune',
      label: 'Solune Gate',
    },
    arrival:
      'Beacon acquired. You have reached SOLUNE — the innermost station, the closest hold above the ' +
      'Void. The final fragment waits inside. Key in the station code to survive the approach.',
    reveal:
      'Access granted. Solune holds the master key — the complete targeting data for the pulse. It ' +
      'will not yield the last piece without testing you. Solve it, and the map is whole.',
    gained:
      'Fragment IV recovered. All four fragments locked — the targeting data is whole. Only one ' +
      'place remains, and it is waiting. Plot the course to the NULL VOID.',
  },
  4: {
    name: 'The Null Void',
    descriptor: 'the black hole at the centre',
    kind: 'terminal',
    fragment: null,
    robot: {
      avatar: 'robot-void',
      label: 'The Custodian',
    },
    arrival:
      'All beacons fall silent. There is nothing between you and the NULL VOID — only the shuttle’s ' +
      'hull and the dark. Key in the final code to cross its edge.',
    reveal:
      'Inside the Void, the world is silent. This is the end of the hunt — take the final measure ' +
      'and fire the pulse that was meant to cure it all.',
    gained: '',
  },
}

export function getPlanet(progress) {
  const p = Math.max(0, Math.min(4, progress || 0))
  return STATIONS[p]
}

export const PLANET_LIST = [0, 1, 2, 3, 4].map((p) => STATIONS[p])

// The fragment beat logged after a correct answer for a station.
export function getStation(progress) {
  return STATIONS[Math.max(0, Math.min(4, progress || 0))]
}
