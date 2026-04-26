import { test, expect } from '@playwright/test'

const BASE_URL = process.env.DEPLOY_URL || 'https://bjjcompass.netlify.app'

test('app loads and has correct tabs', async ({ page }) => {
  await page.goto(BASE_URL)

  // Check header
  await expect(page.locator('h1')).toContainText('BJJ COMPASS')

  // Check all 3 tabs exist
  await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Breathe' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'History' })).toBeVisible()

  // Dashboard should NOT have breathing circle (it's on Breathe tab)
  const dashboardTab = page.getByRole('button', { name: 'Dashboard' })
  await dashboardTab.click()
  await expect(page.locator('.breathing-circle')).not.toBeVisible()

  // Breathe tab should have breathing circle
  const breatheTab = page.getByRole('button', { name: 'Breathe' })
  await breatheTab.click()
  await expect(page.locator('.breathing-circle')).toBeVisible()
  await expect(page.getByRole('button', { name: 'START' })).toBeVisible()

  // History tab
  const historyTab = page.getByRole('button', { name: 'History' })
  await historyTab.click()
  await expect(page.getByText('Training History')).toBeVisible()
})

test('no console errors on load', async ({ page }) => {
  const errors = []
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle')

  expect(errors).toHaveLength(0)
})
