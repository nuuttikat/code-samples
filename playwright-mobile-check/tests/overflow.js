// Shared by the tests: what sticks out past the screen edge.
/** Elements whose right edge is past the screen edge (outside sideways-scrolling rows), at most 5. */
export function overflowing(page) {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth
    const scrollsSideways = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const o = getComputedStyle(p).overflowX
        if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return true
      }
      return false
    }
    const found = []
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height <= 1 || r.right <= width + 1) continue
      if (getComputedStyle(el).position === 'fixed' || scrollsSideways(el)) continue
      if (found.some((f) => f.el.contains(el))) continue
      const name = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '')
      found.push({ el, text: `${name} ends at ${Math.round(r.right)} px (screen ${width} px)` })
      if (found.length >= 5) break
    }
    return found.map((f) => f.text)
  })
}

/** Collects JavaScript errors, console errors, failed requests and 4xx/5xx answers. */
export function watch(page) {
  const problems = []
  page.on('pageerror', (e) => problems.push(`JavaScript error: ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`Console error: ${m.text()}`) })
  page.on('requestfailed', (r) => problems.push(`Request failed: ${r.url()}`))
  page.on('response', (r) => { if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`) })
  return problems
}
