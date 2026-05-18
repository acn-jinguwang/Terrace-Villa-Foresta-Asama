'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { splitByWords } from '@/utils/splitByWords'

export function useHeroEntrance() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLHeadingElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const desc2Ref = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const title = titleRef.current
    const subtitle = subtitleRef.current
    if (!title || !subtitle) return

    const titleWords = splitByWords(title)
    const subtitleWords = splitByWords(subtitle)

    const tl = gsap.timeline({ delay: 0.3, defaults: { ease: 'power3.out' } })

    tl.to(eyebrowRef.current, { opacity: 1, duration: 0.6 })
      .to(titleWords, { y: '0%', opacity: 1, duration: 1.1, stagger: 0.1 }, '-=0.3')
      .to(subtitleWords, { y: '0%', opacity: 1, duration: 0.9, stagger: 0.08 }, '-=0.6')
      .to(descRef.current, { opacity: 1, duration: 0.6 }, '-=0.4')
      .to(desc2Ref.current, { opacity: 1, duration: 0.5 }, '-=0.3')
      .to(ctaRef.current, { opacity: 1, duration: 0.5 }, '-=0.2')
      .to(scrollRef.current, { opacity: 1, duration: 0.5 }, '-=0.2')

    return () => { tl.kill() }
  }, [])

  return { titleRef, subtitleRef, eyebrowRef, descRef, desc2Ref, ctaRef, scrollRef }
}
