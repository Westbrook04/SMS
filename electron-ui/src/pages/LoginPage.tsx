import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, message, Tabs } from 'antd'
import { UserOutlined, LockOutlined, MobileOutlined, SafetyOutlined, CodeOutlined } from '@ant-design/icons'
import { login, sendCode, loginByCode } from '../api/authApi'
import '../App.css'
/**
 * 生成随机验证码（4位数字+字母，排除易混淆字符）
 */
function generateCaptcha(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * 在 canvas 上绘制验证码图片
 * 背景改成半透明，让外层玻璃壳的质感透出来，不像一张直接贴上去的图
 */
function drawCaptcha(canvas: HTMLCanvasElement, code: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height

  // 半透明底（原来是纯色 #f0f5ff）
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.fillRect(0, 0, w, h)

  // 干扰线（3条随机线条）
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(Math.random() * w, Math.random() * h)
    ctx.lineTo(Math.random() * w, Math.random() * h)
    ctx.strokeStyle = `rgba(24, 144, 255, ${0.2 + Math.random() * 0.3})`
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // 干扰点（30个随机小点）
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(24, 144, 255, ${0.1 + Math.random() * 0.4})`
    ctx.beginPath()
    ctx.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // 绘制验证码字符（每个字符不同颜色、轻微旋转）
  const colors = ['#007bde', '#52c41a', '#faad14', '#f5222d', '#722ed1']
  for (let i = 0; i < code.length; i++) {
    const angle = (Math.random() - 0.5) * 0.4
    ctx.save()
    ctx.translate(20 + i * 22 + Math.random() * 4, 22 + Math.random() * 4)
    ctx.rotate(angle)
    ctx.font = 'bold 22px Arial'
    ctx.fillStyle = colors[i % colors.length]
    ctx.fillText(code[i], 0, 0)
    ctx.restore()
  }
}

/**
 * 左侧植物影子：一簇绕叶柄散开的叶片，经 CSS 重度模糊后像枝叶投下的影
 */
function LeafShadow({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 200 260" aria-hidden="true">
      <g fill="#2e4f3c">
        {[-58, -34, -12, 12, 34, 58].map((deg) => (
          <ellipse key={deg} cx="100" cy="72" rx="15" ry="54" transform={`rotate(${deg} 100 210)`} />
        ))}
      </g>
    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [codeForm] = Form.useForm()
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(false)
  const [codeLoading, setCodeLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // 左侧视觉层引用：柔光 div 与浮尘 canvas（特效严格限制在左栏）
  const leftPaneRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const dustRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    window.electronAPI.resizeWindow(900, 580)

    // 读取记住的密码
    const savedUsername = localStorage.getItem('saved_username')
    const savedPassword = localStorage.getItem('saved_password')
    const rememberMe = localStorage.getItem('remember_me') === 'true'
    if (rememberMe && savedUsername) {
      form.setFieldsValue({
        username: savedUsername,
        password: savedPassword || '',
        remember: true,
      })
    }
  }, [])

  // 发送验证码后的 60 秒倒计时（与后端限流规则一致，前端只做体验提示）
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((s) => s - 1), 1000)
    return () => clearInterval(timer)   // 组件卸载或倒计时变化时清理定时器
  }, [countdown > 0])


  // 验证码变化时重新绘制
  useEffect(() => {
    if (canvasRef.current) {
      drawCaptcha(canvasRef.current, captcha)
    }
  }, [captcha])

  // 左侧视觉特效：柔光惯性跟随 + 光束浮尘 + 按住拖动扬尘
  // 监听只挂在左栏容器上，canvas 为 pointer-events: none，不会影响右侧表单
  useEffect(() => {
    const pane = leftPaneRef.current
    const glow = glowRef.current
    const canvas = dustRef.current
    if (!pane || !glow || !canvas) return
    // 尊重系统「减少动态效果」设置：不启用跟随与粒子
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 预渲染一颗柔和尘粒贴图，之后 drawImage 复用，避免每帧创建径向渐变
    const sprite = document.createElement('canvas')
    sprite.width = sprite.height = 32
    const sctx = sprite.getContext('2d')
    if (!sctx) return
    const grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    grad.addColorStop(0, 'rgba(255, 253, 246, 1)')
    grad.addColorStop(0.45, 'rgba(255, 253, 246, 0.45)')
    grad.addColorStop(1, 'rgba(255, 253, 246, 0)')
    sctx.fillStyle = grad
    sctx.fillRect(0, 0, 32, 32)

    // canvas 尺寸跟随左栏
    let width = 0
    let height = 0
    const resize = () => {
      const rect = pane.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width
      canvas.height = height
    }
    resize()
    window.addEventListener('resize', resize)

    // 柔光位置：当前值向鼠标目标值缓慢靠近，形成惯性
    let targetX = width * 0.68
    let targetY = height * 0.3
    let glowX = targetX
    let glowY = targetY

    // 拖动扬尘粒子
    interface TrailParticle {
      x: number; y: number
      vx: number; vy: number
      size: number
      born: number
      life: number
    }
    const trail: TrailParticle[] = []
    const TRAIL_MAX = 140
    let dragging = false
    let lastX = 0
    let lastY = 0
    let accDist = 0
    let nextEmit = 8 + Math.random() * 6   // 每移动约 8–14px 发射一批

    // 环境浮尘：始终在左栏缓慢漂移，亮度随是否处于光束中带变化
    const ambient = Array.from({ length: 34 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.6 + Math.random() * 2.6,
      drift: 0.6 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
    }))

    // 光束从右上斜向左下，用归一化坐标 s = x + y 靠近 1（主光束）或 0.72（副光束）
    // 近似判断尘粒是否在光束里，返回 0~1 的亮度系数
    const beamGlow = (nx: number, ny: number) => {
      const s = nx + ny
      const main = Math.max(0, 1 - Math.abs(s - 1) / 0.16)
      const side = Math.max(0, 1 - Math.abs(s - 0.72) / 0.1) * 0.6
      return Math.max(main, side)
    }

    const toLocal = (e: MouseEvent) => {
      const rect = pane.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const onMouseMove = (e: MouseEvent) => {
      const { x, y } = toLocal(e)
      targetX = x
      targetY = y
      if (dragging) {
        accDist += Math.hypot(x - lastX, y - lastY)
        while (accDist >= nextEmit) {
          accDist -= nextEmit
          nextEmit = 8 + Math.random() * 6
          const count = 1 + Math.floor(Math.random() * 3)   // 每批 1–3 颗
          for (let i = 0; i < count; i++) {
            if (trail.length >= TRAIL_MAX) trail.shift()    // 同屏上限 140
            trail.push({
              x, y,
              vx: (Math.random() - 0.5) * 0.7,
              vy: -0.15 - Math.random() * 0.45,
              size: 5 + Math.random() * 9,
              born: performance.now(),
              life: 650 + Math.random() * 550,              // 寿命 650–1200ms
            })
          }
        }
      }
      lastX = x
      lastY = y
    }
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      dragging = true
      const { x, y } = toLocal(e)
      lastX = x
      lastY = y
      accDist = 0
    }
    const onMouseUp = () => { dragging = false }   // 松开后停止发射，已有粒子自然消散

    pane.addEventListener('mousemove', onMouseMove)
    pane.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    let raf = 0
    let lastTime = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(50, now - lastTime)
      lastTime = now
      const step = dt / 16.7   // 以 60fps 为基准的步长，低帧率时动画速度不失真

      // 柔光惯性跟随（惯性系数 0.08）
      glowX += (targetX - glowX) * 0.08 * step
      glowY += (targetY - glowY) * 0.08 * step
      glow.style.transform = `translate3d(${glowX - 90}px, ${glowY - 90}px, 0)`

      ctx.clearRect(0, 0, width, height)

      // 环境浮尘：沿光束方向缓慢漂移，越在光束里越亮
      for (const p of ambient) {
        p.x -= 0.00004 * p.drift * dt
        p.y += 0.00005 * p.drift * dt
        if (p.x < -0.05) p.x = 1.05
        if (p.y > 1.05) p.y = -0.05
        const flicker = 0.7 + 0.3 * Math.sin(now / 900 + p.phase)
        const alpha = (0.05 + 0.3 * beamGlow(p.x, p.y)) * flicker
        if (alpha <= 0.01) continue
        const px = p.x * width
        const py = p.y * height
        const size = p.r * 3
        ctx.globalAlpha = Math.min(0.5, alpha)
        ctx.drawImage(sprite, px - size / 2, py - size / 2, size, size)
      }

      // 拖动扬尘：轻微上升后减速扩散，约 1 秒内自然消失
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i]
        const age = now - p.born
        if (age >= p.life) {
          trail.splice(i, 1)
          continue
        }
        p.vx *= 0.985
        p.vy = p.vy * 0.985 + 0.004
        p.x += p.vx * step
        p.y += p.vy * step
        const t = age / p.life
        const size = p.size * (1 + t * 0.9)
        ctx.globalAlpha = Math.pow(1 - t, 1.3) * 0.55
        ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size)
      }
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    // 卸载时清理监听与动画帧
    return () => {
      cancelAnimationFrame(raf)
      pane.removeEventListener('mousemove', onMouseMove)
      pane.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const handleRefreshCaptcha = () => {
    setCaptcha(generateCaptcha())
  }

  // 两种登录方式共用的成功收尾：存 token、跳主页
  const onLoginSuccess = (data: { token: string; username: string }) => {
    message.success('登录成功！')
    localStorage.setItem('sms_token', data.token)
    localStorage.setItem('sms_username', data.username)
    localStorage.setItem('sms_logged_in', 'true')
    window.electronAPI.resizeWindow(1200, 800)
    navigate('/', { replace: true })
  }

  const handleLogin = async (values: { username: string; password: string; captchaInput: string; remember?: boolean }) => {
    // 先验证验证码（不区分大小写）
    if (values.captchaInput.toUpperCase() !== captcha.toUpperCase()) {
      message.error('验证码错误')
      handleRefreshCaptcha()
      return
    }

    setLoading(true)

    try {
      const res = await login(values.username, values.password)
      const { success, data, error } = res.data

      if (success && data) {
        // 记住密码
        if (values.remember) {
          localStorage.setItem('remember_me', 'true')
          localStorage.setItem('saved_username', values.username)
          localStorage.setItem('saved_password', values.password)
        } else {
          localStorage.removeItem('remember_me')
          localStorage.removeItem('saved_username')
          localStorage.removeItem('saved_password')
        }

        onLoginSuccess(data)
      } else {
        message.error(error || '登录失败')
        handleRefreshCaptcha()
      }
    } catch {
      message.error('无法连接到服务器，请检查后端是否启动')
      handleRefreshCaptcha()
    } finally {
      setLoading(false)
    }
  }

  // 发送手机验证码
  const handleSendCode = async () => {
    // 手动校验手机号字段，不合法则不发送
    try {
      await codeForm.validateFields(['phone'])
    } catch {
      return
    }
    const phone = codeForm.getFieldValue('phone') as string

    try {
      const res = await sendCode(phone)
      const { success, error } = res.data
      if (success) {
        message.success('验证码已发送（模拟环境请查看后端控制台日志）')
        setCountdown(60)
      } else {
        message.error(error || '发送失败')
      }
    } catch {
      message.error('无法连接到服务器，请检查后端是否启动')
    }
  }

  // 手机号 + 验证码登录
  const handleCodeLogin = async (values: { phone: string; code: string }) => {
    setCodeLoading(true)
    try {
      const res = await loginByCode(values.phone, values.code)
      const { success, data, error } = res.data
      if (success && data) {
        onLoginSuccess(data)
      } else {
        message.error(error || '登录失败')
      }
    } catch {
      message.error('无法连接到服务器，请检查后端是否启动')
    } finally {
      setCodeLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* 顶部拖拽条：拖动窗口用，zIndex 低于关闭按钮。
          注意容器不能整体设 app-region: drag——Windows 上 drag 区域
          按原生标题栏处理，鼠标事件到不了页面，左侧特效就无法跟随 */}
      <div className="login-drag-bar" />

      {/* 左侧视觉面板：光束/植物影子/浮尘/柔光全部 overflow 裁切在这一半，越不过中线 */}
      <div className="login-left" ref={leftPaneRef}>
        <div className="login-beam login-beam-main" />
        <div className="login-beam login-beam-side" />
        <LeafShadow className="leaf-shadow leaf-shadow-tl" />
        <LeafShadow className="leaf-shadow leaf-shadow-bl" />
        <div className="login-glow" ref={glowRef} />
        <canvas className="login-dust" ref={dustRef} />
        <div className="login-left-text">
          <div className="login-left-title">好好学习 · 天天向上</div>
          <div className="login-left-subtitle">STUDENT MANAGEMENT SYSTEM</div>
        </div>
      </div>

      {/* 右侧表单面板：珍珠白安静背景，表单直接排列，无大号玻璃卡片 */}
      <div className="login-right">
        <button
          className="login-close"
          onClick={() => window.electronAPI.closeWindow()}
          title="关闭"
        >
          <span>✕</span>
        </button>
        <div className="login-form-wrap">
          <h2 className="login-title">登录</h2>
          <p className="login-subtitle">欢迎登录威少学生管理系统</p>

          {/* 登录方式切换 */}
          <Tabs
            className="login-glass-tabs"
            defaultActiveKey="password"
            items={[
              {
                key: 'password',
                label: '账号密码登录',
                children: (
                  <Form form={form} onFinish={handleLogin} size="large" autoComplete="off" className="login-glass">
                    {/* 用户名 */}
                    <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                      <Input prefix={<UserOutlined />} placeholder="用户名" />
                    </Form.Item>

                    {/* 密码 */}
                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                      <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                    </Form.Item>

                    {/* 验证码：输入框与图片是两个独立玻璃块 */}
                    <Form.Item name="captchaInput" rules={[{ required: true, message: '请输入验证码' }]}>
                      <div className="login-captcha-row">
                        <Input prefix={<CodeOutlined />} placeholder="验证码" className="login-captcha-input" maxLength={4} />
                        <div className="login-captcha-glass" onClick={handleRefreshCaptcha} title="点击刷新验证码">
                          <canvas ref={canvasRef} width={100} height={40} />
                        </div>
                      </div>
                    </Form.Item>

                    {/* 记住密码 + 忘记密码 */}
                    <Form.Item style={{ marginBottom: 12 }}>
                      <div className="login-remember-row">
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                          <Checkbox>记住密码</Checkbox>
                        </Form.Item>
                        <a className="login-forgot" onClick={() => message.info('请联系管理员重置密码')}>
                          忘记密码？
                        </a>
                      </div>
                    </Form.Item>

                    {/* 登录按钮 */}
                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={loading} block className="login-btn">
                        登 录
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
              {
                key: 'phone',
                label: '手机验证码登录',
                children: (
                  <Form form={codeForm} onFinish={handleCodeLogin} size="large" autoComplete="off" className="login-glass">
                    {/* 手机号 */}
                    <Form.Item
                      name="phone"
                      rules={[
                        { required: true, message: '请输入手机号' },
                        { pattern: /^1\d{10}$/, message: '手机号格式不正确' },
                      ]}
                    >
                      <Input prefix={<MobileOutlined />} placeholder="手机号" maxLength={11} />
                    </Form.Item>

                    {/* 短信验证码 + 发送按钮 */}
                    <Form.Item name="code" rules={[{ required: true, message: '请输入短信验证码' }]}>
                      <div className="login-captcha-row">
                        <Input prefix={<SafetyOutlined />} placeholder="短信验证码" className="login-captcha-input" maxLength={6} />
                        <Button
                          className="login-send-btn"
                          onClick={handleSendCode}
                          disabled={countdown > 0}
                        >
                          {countdown > 0 ? `${countdown}s 后重发` : '发送验证码'}
                        </Button>
                      </div>
                    </Form.Item>

                    {/* 登录按钮 */}
                    <Form.Item style={{ marginTop: 24 }}>
                      <Button type="primary" htmlType="submit" loading={codeLoading} block className="login-btn">
                        登 录
                      </Button>
                    </Form.Item>
                  </Form>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
