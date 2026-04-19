import { test, expect, request } from '@playwright/test'

function uniqueUser(prefix = 'user') {
  const ts = Date.now()
  return {
    username: `${prefix}_${ts}`,
    email: `${prefix}_${ts}@test.com`,
    password: 'TestPass123!',
  }
}

async function registerViaAPI(apiCtx, user) {
  const r = await apiCtx.post('http://localhost:8000/auth/register', { data: user })
  return (await r.json()).access_token
}

async function loginInBrowser(page, token) {
  await page.goto('/')
  await page.evaluate((t) => localStorage.setItem('token', t), token)
  await page.reload()
}

test.describe('社交功能', () => {
  test('搜索用户并显示结果', async ({ page }) => {
    const apiCtx = await request.newContext()
    const alice = uniqueUser('alice')
    const bob = uniqueUser('bob')
    const aliceToken = await registerViaAPI(apiCtx, alice)
    await registerViaAPI(apiCtx, bob)

    await loginInBrowser(page, aliceToken)
    await page.goto('/friends')

    await page.getByPlaceholder(/搜索|search/i).fill(bob.username)
    await expect(page.getByText(bob.username)).toBeVisible({ timeout: 5000 })
    await apiCtx.dispose()
  })

  test('关注用户后出现在关注列表', async ({ page }) => {
    const apiCtx = await request.newContext()
    const alice = uniqueUser('alice')
    const bob = uniqueUser('bob')
    const aliceToken = await registerViaAPI(apiCtx, alice)
    await registerViaAPI(apiCtx, bob)

    await loginInBrowser(page, aliceToken)
    await page.goto('/friends')

    await page.getByPlaceholder(/搜索|search/i).fill(bob.username)
    await page.getByText(bob.username).waitFor()
    await page.getByRole('button', { name: /关注|follow/i }).first().click()

    // 关注按钮状态变化（已关注 / unfollow）
    await expect(
      page.getByRole('button', { name: /已关注|取关|unfollow/i }).first()
    ).toBeVisible({ timeout: 5000 })
    await apiCtx.dispose()
  })

  test('取关后从关注列表移除', async ({ page }) => {
    const apiCtx = await request.newContext()
    const alice = uniqueUser('alice')
    const bob = uniqueUser('bob')
    const aliceToken = await registerViaAPI(apiCtx, alice)
    const bobRes = await apiCtx.post('http://localhost:8000/auth/register', { data: bob })
    const bobId = (await apiCtx.get('http://localhost:8000/auth/me', {
      headers: { Authorization: `Bearer ${(await bobRes.json()).access_token}` },
    })).json().then(d => d.id)

    // 先通过 API 关注
    await apiCtx.post(`http://localhost:8000/users/${await bobId}/follow`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    })

    await loginInBrowser(page, aliceToken)
    await page.goto('/friends')

    await page.getByPlaceholder(/搜索|search/i).fill(bob.username)
    await page.getByText(bob.username).waitFor()
    await page.getByRole('button', { name: /已关注|取关|unfollow/i }).first().click()

    await expect(
      page.getByRole('button', { name: /^关注$|^follow$/i }).first()
    ).toBeVisible({ timeout: 5000 })
    await apiCtx.dispose()
  })
})
