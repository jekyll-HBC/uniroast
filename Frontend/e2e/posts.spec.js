import { test, expect, request } from '@playwright/test'

function uniqueUser(prefix = 'user') {
  const ts = Date.now()
  return {
    username: `${prefix}_${ts}`,
    email: `${prefix}_${ts}@test.com`,
    password: 'TestPass123!',
  }
}

async function loginViaAPI(apiCtx, user) {
  const reg = await apiCtx.post('http://localhost:8000/auth/register', { data: user })
  const { access_token } = await reg.json()
  return access_token
}

async function createThemeViaAPI(apiCtx, token, title = 'E2E Theme') {
  const r = await apiCtx.post('http://localhost:8000/themes/', {
    data: { title, emoji: '🔥' },
    headers: { Authorization: `Bearer ${token}` },
  })
  return (await r.json()).id
}

// 登录并把 token 注入 localStorage，跳过登录页
async function loginInBrowser(page, user, token) {
  await page.goto('/')
  await page.evaluate((t) => localStorage.setItem('token', t), token)
  await page.reload()
}

test.describe('发帖投票流程', () => {
  test('发帖后帖子出现在列表', async ({ page }) => {
    const apiCtx = await request.newContext()
    const user = uniqueUser('post')
    const token = await loginViaAPI(apiCtx, user)
    const themeId = await createThemeViaAPI(apiCtx, token)

    await loginInBrowser(page, user, token)

    // 进入主题页发帖
    await page.goto(`/themes/${themeId}`)
    await page.getByRole('button', { name: /发帖|post|上传/i }).click()
    await page.getByPlaceholder(/图片|image.*url/i).fill('https://picsum.photos/200')
    await page.getByPlaceholder(/吐槽|caption|描述/i).fill('E2E 测试帖子')
    await page.getByRole('button', { name: /提交|发布|submit/i }).click()

    await expect(page.getByText('E2E 测试帖子')).toBeVisible({ timeout: 10000 })
    await apiCtx.dispose()
  })

  test('投票后票数增加', async ({ page }) => {
    const apiCtx = await request.newContext()
    const user = uniqueUser('vote')
    const token = await loginViaAPI(apiCtx, user)
    const themeId = await createThemeViaAPI(apiCtx, token)

    // 通过 API 创建帖子
    const postRes = await apiCtx.post('http://localhost:8000/posts/', {
      data: { theme_id: themeId, image_url: 'https://picsum.photos/200', caption: '投票测试' },
      headers: { Authorization: `Bearer ${token}` },
    })
    const postId = (await postRes.json()).id

    await loginInBrowser(page, user, token)
    await page.goto(`/posts/${postId}`)

    // 点击 heng 投票按钮
    const voteBtn = page.getByRole('button', { name: /夯|heng|👍/i }).first()
    await voteBtn.click()

    // 票数应变为 1
    await expect(page.getByText('1')).toBeVisible({ timeout: 5000 })
    await apiCtx.dispose()
  })
})
