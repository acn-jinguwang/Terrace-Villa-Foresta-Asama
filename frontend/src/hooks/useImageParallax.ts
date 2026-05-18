'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface UseImageParallaxOptions {
  scaleFrom?: number
  scaleTo?: number
  yPercentFrom?: number
  yPercentTo?: number
  triggerStart?: string
  triggerEnd?: string
}

export function useImageParallax<T extends HTMLElement>(
  options: UseImageParallaxOptions = {}
) {
  const containerRef = useRef<T>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const {
    scaleFrom = 1.08,
    scaleTo = 1.0,
    yPercentFrom = 6,
    yPercentTo = -6,
    triggerStart = 'top top',
    triggerEnd = 'bottom top',
  } = options

  useEffect(() => {
    const container = containerRef.current
    const image = imageRef.current
    if (!container || !image) return

    gsap.set(image, { scale: scaleFrom, yPercent: yPercentFrom })

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: triggerStart,
      end: triggerEnd,
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        gsap.set(image, {
          scale: scaleFrom - p * (scaleFrom - scaleTo),
          yPercent: yPercentFrom - p * (yPercentFrom - yPercentTo),
        })
      },
    })

    return () => trigger.kill()
  }, [scaleFrom, scaleTo, yPercentFrom, yPercentTo, triggerStart, triggerEnd])

  return { containerRef, imageRef }
}
