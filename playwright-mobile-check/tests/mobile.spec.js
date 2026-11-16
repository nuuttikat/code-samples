// Every page on each phone size: full-page screenshot, nothing sticking out past the
// screen edge, and no JavaScript errors or failed requests.
import { test, expect } from '@playwright/test'
import { overflowing, watch } from './overflow.js'

const PAGES = ['/', '/contact.html']

for (const path of PAGES) {
  test(`fits the screen: ${path}`, async ({ page }, testInfo) => {
    const problems = watch(page)
    await page.goto(path, { waitUntil: 'networkidle' })
    await page.screenshot({ path: `test-results/${testInfo.project.name}${path === '/' ? '/home' : path}.png`, fullPage: true })
    expect(await overflowing(page), `Sticks out past the screen edge on ${path}`).toEqual([])
    expect(problems, `Errors on ${path}`).toEqual([])
  })
}

// Proves the check works: this page is broken on purpose.
test('catches a page that is too wide', async ({ page }) => {
  await page.goto('/broken.html')
  const found = await overflowing(page)
  expect(found.length).toBeGreaterThan(0)
  expect(found[0]).toContain('div#wide-banner')
})
