export function splitByWords(el: HTMLElement): HTMLElement[] {
  const text = el.textContent?.trim() || ''
  el.innerHTML = ''
  const inners: HTMLElement[] = []

  text.split(/\s+/).forEach((word, i, arr) => {
    const outer = document.createElement('span')
    outer.style.display = 'inline-block'
    outer.style.overflow = 'hidden'
    outer.style.verticalAlign = 'bottom'

    const inner = document.createElement('span')
    inner.style.display = 'inline-block'
    inner.style.transform = 'translateY(110%)'
    inner.style.opacity = '0'
    inner.textContent = word

    outer.appendChild(inner)
    el.appendChild(outer)
    if (i < arr.length - 1) el.appendChild(document.createTextNode(' '))
    inners.push(inner)
  })

  return inners
}
