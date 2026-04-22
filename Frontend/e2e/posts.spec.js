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

async function createTheme(apiCtx, token, title = 'E2E Theme') {
  const r = await apiCtx.post('http://localhost:8000/themes/', {
    data: { title, emoji: '🔥' },
    headers: { Authorization: `Bearer ${token}` },
  })
  return (await r.json()).id
}

async function injectToken(page, token) {
  await page.goto('/')
  await page.evaluate((t) => localStorage.setItem('token', t), token)
  await page.reload()
}

test.describe('发帖投票流程', () => {
  test('通过 API 发帖后帖子出现在主题页', async ({ page }) => {
    const apiCtx = await request.newContext()
    const { token } = await setupUser(apiCtx, 'post')
    const themeId = await createTheme(apiCtx, token)

    // 通过 API 直接创建帖子（绕过 Cloudinary 上传）
    await apiCtx.post('http://localhost:8000/posts/', {
      data: { theme_id: themeId, image_url: 'https://picsum.photos/200', caption: 'E2E 测试帖子' },
      headers: { Authorization: `Bearer ${token}` },
    })

    await injectToken(page, token)
    await page.goto(`/theme/${themeId}`)

    // 帖子出现在主题页（grid card 只显示用户名和 tier，验证参战人数）
    await expect(page.getByText('1 人已参战')).toBeVisible({ timeout: 5000 })
    await apiCtx.dispose()
  })

  test('投票后票数增加', async ({ page }) => {
    const apiCtx = await request.newContext()
    const { token } = await setupUser(apiCtx, 'vote')
    const themeId = await createTheme(apiCtx, token)

    // 通过 API 创建帖子
    const postRes = await apiCtx.post('http://localhost:8000/posts/', {
      data: { theme_id: themeId, image_url: 'https://picsum.photos/200', caption: '投票测试' },
      headers: { Authorization: `Bearer ${token}` },
    })
    const postId = (await postRes.json()).id

    await injectToken(page, token)
    await page.goto(`/post/${postId}`)

    // 点击 🔥 夯 按钮
    await page.getByRole('button', { name: /🔥\s*夯/i }).click()

    // 票数变为 1
    await expect(page.locator('text=1 次投票')).toBeVisible({ timeout: 5000 })
    await apiCtx.dispose()
  })
})
