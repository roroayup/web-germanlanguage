import { useEffect, useRef } from 'react'

/**
 * Adds `.is-visible` to elements marked `.reveal` once they scroll into view.
 * IntersectionObserver keeps this off the scroll thread, and unobserving after
 * the first hit means each element animates exactly once.
 */
export function useReveal() {
  const containerRef = useRef(null)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const targets = root.querySelectorAll('.reveal')
    if (!targets.length) return

    if (!('IntersectionObserver' in window)) {
      targets.forEach((element) => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    targets.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return containerRef
}
