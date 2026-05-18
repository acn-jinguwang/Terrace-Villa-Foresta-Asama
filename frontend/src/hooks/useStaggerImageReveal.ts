'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface UseStaggerImageRevealOptions {
  selector?: string
  scaleFrom?: number
  stagger?: number
  duration?: number
  triggerStart?: string
}

export function useStaggerImageReveal<T extends HTMLElement>(
  options: UseStaggerImageRevealOptions = {}
) {
  const ref = useRef<T>(null)
  const {
    selector = 'img',
    scaleFrom = 0.94,
    stagger = 0.1,
    duration = 0.7,
    triggerStart = 'top 80%',
  } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const images = el.querySelectorAll(selector)
    gsap.set(images, { opacity: 0, scale: scaleFrom })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: triggerStart,
      once: true,
      onEnter: () => {
        gsap.to(images, {
          opacity: 1, scale: 1, duration, stagger, ease: 'power2.out',
        })
      },
    })

    return () => trigger.kill()
  }, [selector, scaleFrom, stagger, duration, triggerStart])

  return ref
}
