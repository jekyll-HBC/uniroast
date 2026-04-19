import { test, expect } from '@playwright/test'

function uniqueUser(prefix = 'user') {
  const ts = Date.now()
  return {
    username: `${prefix}_${ts}`,
    email: `${prefix}_${ts}@test.com`,
    password: 'TestPass123!',
  }
}

test.describe('认证流程', () => {
  test('注册新用户后跳转首页', async ({ page }) => {
    const user = uniqueUser('reg')
    await page.goto('/login')
    await page.getByRole('button', { name: /还没有账号|去注册/i }).click()
    await page.getByPlaceholder('输入用户名').fill(user.username)
    await page.getByPlaceholder('your@email.com').fill(user.email)
    await page.getByPlaceholder('输入密码').fill(user.password)
    await page.getByRole('button', { name: '注册' }).click()
    await expect(page).toHaveURL('/')
  })

  test('登录已有账号后跳转首页', async ({ page }) => {
    const user = uniqueUser('login')
    await page.request.post('http://localhost:8000/auth/register', { data: user })

    await page.goto('/login')
    await page.getByPlaceholder('your@email.com').fill(user.email)
    await page.getByPlaceholder('输入密码').fill(user.password)
    await page.getByRole('button', { name: '使用账号密码' }).click()
    await expect(page).toHaveURL('/')
  })

  test('密码错误时停留在登录页并显示错误', async ({ page }) => {
    const user = uniqueUser('wrongpw')
    await page.request.post('http://localhost:8000/auth/register', { data: user })

    await page.goto('/login')
    await page.getByPlaceholder('your@email.com').fill(user.email)
    await page.getByPlaceholder('输入密码').fill('WrongPassword!')
    await page.getByRole('button', { name: '使用账号密码' }).click()
    await expect(page).toHaveURL('/login')
    await expect(page.getByText(/操作失败|Invalid/i)).toBeVisible({ timeout: 5000 })
  })

  test('登录后 Navbar 显示用户名', async ({ page }) => {
    const user = uniqueUser('navuser')
    const res = await page.request.post('http://localhost:8000/auth/register', { data: user })
    const { access_token } = await res.json()

    await page.goto('/')
    await page.evaluate((t) => localStorage.setItem('token', t), access_token)
    await page.reload()
    await expect(page.getByText(user.username)).toBeVisible({ timeout: 5000 })
  })
})
