import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests',
  use: { baseURL: 'http://127.0.0.1:4173' },
  // Small and large phones: most layout bugs show up at one of these widths.
  projects: [
    { name: 'iphone-se', use: { ...devices['iPhone SE'], browserName: 'chromium' } },
    { name: 'iphone-15-pro-max', use: { ...devices['iPhone 15 Pro Max'], browserName: 'chromium' } },
  ],
  webServer: { command: 'node serve.js', url: 'http://127.0.0.1:4173/', reuseExistingServer: !process.env.CI },
})
