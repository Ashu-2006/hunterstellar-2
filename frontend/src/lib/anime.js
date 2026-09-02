import anime from 'animejs'

export { anime }
export default anime

export function fadeUp(el, delay = 0) {
  if (!el) return
  anime({ targets: el, translateY: [16, 0], opacity: [0, 1], duration: 380, delay, easing: 'easeOutCubic' })
}

export function pulseOnce(el) {
  if (!el) return
  anime.remove(el)
  anime({ targets: el, scale: [1, 1.03, 1], duration: 300, easing: 'easeOutCubic' })
}

export function shuttleLoop(shuttleEl, exhaustEl) {
  if (shuttleEl) {
    anime({ targets: shuttleEl, translateY: [0, -4], duration: 1600, direction: 'alternate', loop: true, easing: 'easeInOutSine' })
  }
  if (exhaustEl) {
    anime({ targets: exhaustEl, width: [40, 52], opacity: [0.9, 0.6], duration: 500, direction: 'alternate', loop: true, easing: 'easeInOutSine' })
  }
}

export function starfield(el) {
  if (!el) return
  anime({ targets: el, opacity: [1, 0.7, 1], duration: 2000, loop: true, easing: 'linear' })
}

export function progressFill(el, pct) {
  if (!el) return
  anime({ targets: el, width: `${pct}%`, duration: 500, easing: 'easeOutCubic' })
}
