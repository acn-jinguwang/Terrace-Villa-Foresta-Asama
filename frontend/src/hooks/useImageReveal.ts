'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface UseImageRevealOptions {
  scaleFrom?: number
  duration?: number
  triggerStart?: string
}

export function useImageReveal<T extends HTMLElement>(
  options: UseImageRevealOptions = {}
) {
  const ref = useRef<T>(null)
  const { scaleFrom = 0.92, duration = 0.9, triggerStart = 'top 82%' } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    gsap.set(el, { opacity: 0, scale: scaleFrom })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: triggerStart,
      once: true,
      onEnter: () => {
        gsap.to(el, { opacity: 1, scale: 1, duration, ease: 'power2.out' })
      },
    })

    return () => trigger.kill()
  }, [scaleFrom, duration, triggerStart])

  return ref
}
