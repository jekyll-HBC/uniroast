import { test, expect } from '@playwright/test'

// 每个测试用唯一邮箱避免冲突
function uniqueUser(prefix = 'user') {
  const ts = Date.now()
  return {
    username: `${prefix}_${ts}`,
    email: `${prefix}_${ts}@test.com`,
    password: 'TestPass123!',
  }
}

test.describe('认证流程', () => {
  test('注册新用户', async ({ page }) => {
    const user = uniqueUser('reg')
    await page.goto('/register')
    await page.getByPlaceholder(/用户名|username/i).fill(user.username)
    await page.getByPlaceholder(/邮箱|email/i).fill(user.email)
    await page.getByPlaceholder(/密码|password/i).fill(user.password)
    await page.getByRole('button', { name: /注册|register/i }).click()
    // 注册成功后跳转到首页
    await expect(page).toHaveURL('/')
  })

  test('登录已有账号', async ({ page }) => {
    const user = uniqueUser('login')
    // 先通过 API 注册
    await page.request.post('http://localhost:8000/auth/register', {
      data: user,
    })

    await page.goto('/login')
    await page.getByPlaceholder(/邮箱|email/i).fill(user.email)
    await page.getByPlaceholder(/密码|password/i).fill(user.password)
    await page.getByRole('button', { name: /登录|login/i }).click()
    await expect(page).toHaveURL('/')
  })

  test('密码错误登录失败', async ({ page }) => {
    const user = uniqueUser('wrongpw')
    await page.request.post('http://localhost:8000/auth/register', { data: user })

    await page.goto('/login')
    await page.getByPlaceholder(/邮箱|email/i).fill(user.email)
    await page.getByPlaceholder(/密码|password/i).fill('WrongPassword!')
    await page.getByRole('button', { name: /登录|login/i }).click()
    // 应停留在登录页并显示错误
    await expect(page).toHaveURL('/login')
  })

  test('登出后跳转到登录页', async ({ page }) => {
    const user = uniqueUser('logout')
    await page.request.post('http://localhost:8000/auth/register', { data: user })

    await page.goto('/login')
    await page.getByPlaceholder(/邮箱|email/i).fill(user.email)
    await page.getByPlaceholder(/密码|password/i).fill(user.password)
    await page.getByRole('button', { name: /登录|login/i }).click()
    await expect(page).toHaveURL('/')

    // 点击登出
    await page.getByRole('button', { name: /登出|退出|logout/i }).click()
    await expect(page).toHaveURL('/login')
  })
})
