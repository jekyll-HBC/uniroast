import { test, expect, request } from '@playwright/test'

function uniqueUser(prefix = 'user') {
  const ts = Date.now()
  return {
    username: `${prefix}_${ts}`,
    email: `${prefix}_${ts}@test.com`,
    password: 'TestPass123!',
  }
}

async function setupUser(apiCtx, prefix) {
  const user = uniqueUser(prefix)
  const res = await apiCtx.post('http://localhost:8000/auth/register', { data: user })
  const { access_token } = await res.json()
  return { user, token: access_token }
}

async function injectToken(page, token) {
  await page.goto('/')
  await page.evaluate((t) => localStorage.setItem('token', t), token)
  await page.reload()
}

test.describe('社交功能', () => {
  test('搜索用户并显示结果', async ({ page }) => {
    const apiCtx = await request.newContext()
    const { token: aliceToken } = await setupUser(apiCtx, 'alice')
    const { user: bob } = await setupUser(apiCtx, 'bob')

    await injectToken(page, aliceToken)
    await page.goto('/friends')

    await page.getByPlaceholder('搜索用戶名…').fill(bob.username)
    await page.getByRole('button', { name: '搜索' }).click()
    await expect(page.getByText(bob.username)).toBeVisible({ timeout: 5000 })
    await apiCtx.dispose()
  })

  test('关注用户后按钮变为已關注', async ({ page }) => {
    const apiCtx = await request.newContext()
    const { token: aliceToken } = await setupUser(apiCtx, 'alice')
    const { user: bob } = await setupUser(apiCtx, 'bob')

    await injectToken(page, aliceToken)
    await page.goto('/friends')

    await page.getByPlaceholder('搜索用戶名…').fill(bob.username)
    await page.getByRole('button', { name: '搜索' }).click()
    // 等搜索結果 tab 出现，确保结果已加载
    await page.getByRole('button', { name: '搜索結果' }).waitFor({ timeout: 5000 })

    // 关注按钮（繁体，exact 避免匹配 tab 上的"關注 0"）
    await page.getByRole('button', { name: '關注', exact: true }).click()
    await expect(page.getByRole('button', { name: '已關注', exact: true })).toBeVisible({ timeout: 5000 })
    await apiCtx.dispose()
  })

  test('取关后按钮恢复为關注', async ({ page }) => {
    const apiCtx = await request.newContext()
    const { user: alice, token: aliceToken } = await setupUser(apiCtx, 'alice')
    const { user: bob } = await setupUser(apiCtx, 'bob')

    // 先通过 API 获取 bob 的 id 再关注
    const meRes = await apiCtx.get('http://localhost:8000/auth/me', {
      headers: { Authorization: `Bearer ${aliceToken}` },
    })
    const aliceId = (await meRes.json()).id

    // 搜索获取 bob id
    const searchRes = await apiCtx.get(`http://localhost:8000/users/search?q=${bob.username}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    })
    const bobId = (await searchRes.json())[0].id

    await apiCtx.post(`http://localhost:8000/users/${bobId}/follow`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    })

    await injectToken(page, aliceToken)
    await page.goto('/friends')

    await page.getByPlaceholder('搜索用戶名…').fill(bob.username)
    await page.getByRole('button', { name: '搜索' }).click()
    await page.getByRole('button', { name: '搜索結果' }).waitFor({ timeout: 5000 })

    await page.getByRole('button', { name: '已關注', exact: true }).first().click()
    await expect(page.getByRole('button', { name: '關注', exact: true })).toBeVisible({ timeout: 5000 })
    await apiCtx.dispose()
  })
})
