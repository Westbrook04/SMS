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
 */
function drawCaptcha(canvas: HTMLCanvasElement, code: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height

  // 背景色
  ctx.fillStyle = '#f0f5ff'
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

export default function LoginPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [codeForm] = Form.useForm()
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(false)
  const [codeLoading, setCodeLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // 吉祥物眼睛跟随鼠标所需的眼白/眼球引用
  const leftEyeRef = useRef<SVGCircleElement>(null)
  const rightEyeRef = useRef<SVGCircleElement>(null)
  const leftPupilRef = useRef<SVGGElement>(null)
  const rightPupilRef = useRef<SVGGElement>(null)

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

  // 吉祥物眼球跟随鼠标：以眼白中心为原点，限制眼球最大偏移 5px
  useEffect(() => {
    const eyes = [
      { eye: leftEyeRef, pupil: leftPupilRef },
      { eye: rightEyeRef, pupil: rightPupilRef },
    ]
    const onMouseMove = (e: MouseEvent) => {
      for (const { eye, pupil } of eyes) {
        const eyeEl = eye.current
        const pupilEl = pupil.current
        if (!eyeEl || !pupilEl) continue
        const rect = eyeEl.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const angle = Math.atan2(dy, dx)
        const dist = Math.min(5, Math.hypot(dx, dy) / 20)
        pupilEl.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`
      }
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
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
    <div style={styles.container}>
      {/* 顶部拖拽条：拖动窗口用，zIndex 低于关闭按钮 */}
      <div style={styles.dragBar} />
      {/* 左侧吉祥物面板 */}
      <div style={styles.leftPanel}>
        <div style={styles.decoCircle1} />
        <div style={styles.decoCircle2} />
        <div style={styles.decoCircle3} />
        <div className="mascot-float">
          <svg viewBox="0 0 200 220" width={210} height={231}>
            <defs>
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#79B6FF" />
                <stop offset="100%" stopColor="#4A86E8" />
              </linearGradient>
            </defs>
            {/* 地面阴影 */}
            <ellipse cx="100" cy="206" rx="46" ry="7" fill="rgba(31,45,61,0.10)" />
            {/* 两只小手臂 */}
            <ellipse cx="45" cy="138" rx="11" ry="19" fill="#4A86E8" transform="rotate(25 45 138)" />
            <ellipse cx="155" cy="138" rx="11" ry="19" fill="#4A86E8" transform="rotate(-25 155 138)" />
            {/* 圆润的身体 */}
            <path
              d="M100 48 C142 48 158 88 157 128 C156 168 136 198 100 198 C64 198 44 168 43 128 C42 88 58 48 100 48 Z"
              fill="url(#bodyGrad)"
            />
            {/* 浅色肚皮 */}
            <ellipse cx="100" cy="152" rx="36" ry="32" fill="#A9CDFF" opacity="0.5" />
            {/* 学士帽 */}
            <g transform="rotate(-10 100 50)">
              <polygon points="100,24 140,43 100,62 60,43" fill="#2F3B52" />
              <rect x="84" y="46" width="32" height="15" rx="5" fill="#3B4A63" />
              <line x1="136" y1="45" x2="136" y2="64" stroke="#FFC53D" strokeWidth="3" strokeLinecap="round" />
              <circle cx="136" cy="67" r="4" fill="#FFC53D" />
            </g>
            {/* 眼睛（mascot-eye 类提供眨眼动画，眼白静止、眼球跟随鼠标） */}
            <g className="mascot-eye">
              <circle ref={leftEyeRef} cx="76" cy="106" r="15" fill="#fff" />
              <g ref={leftPupilRef} className="mascot-pupil">
                <circle cx="76" cy="106" r="7" fill="#22303F" />
                <circle cx="78.5" cy="103" r="2.2" fill="#fff" />
              </g>
            </g>
            <g className="mascot-eye">
              <circle ref={rightEyeRef} cx="124" cy="106" r="15" fill="#fff" />
              <g ref={rightPupilRef} className="mascot-pupil">
                <circle cx="124" cy="106" r="7" fill="#22303F" />
                <circle cx="126.5" cy="103" r="2.2" fill="#fff" />
              </g>
            </g>
            {/* 腮红 */}
            <ellipse cx="60" cy="128" rx="7" ry="4.5" fill="#FFAFC5" opacity="0.75" />
            <ellipse cx="140" cy="128" rx="7" ry="4.5" fill="#FFAFC5" opacity="0.75" />
            {/* 微笑 */}
            <path d="M88 138 Q100 149 112 138" stroke="#22303F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div style={styles.panelTitle}>好好学习 · 天天向上</div>
        <div style={styles.panelSubtitle}>STUDENT MANAGEMENT SYSTEM</div>
      </div>

      {/* 右侧表单区 */}
      <div style={styles.rightPanel}>
        <button
          onClick={() => window.electronAPI.closeWindow()}
          style={styles.closeBtn}
          title="关闭"
        >
          ✕
        </button>
        {/* 表单内容整体禁止拖拽，留出四周空白供拖动窗口 */}
        <div style={styles.formWrap}>
          <h2 style={styles.title}>登录</h2>
          <p style={styles.formSubtitle}>欢迎登录威少学生管理系统</p>

          {/* 登录方式切换 */}
          <Tabs
            defaultActiveKey="password"
            items={[
              {
                key: 'password',
                label: '账号密码登录',
                children: (
                  <Form form={form} onFinish={handleLogin} size="large" autoComplete="off" className="login-underline">
                    {/* 用户名 */}
                    <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                      <Input prefix={<UserOutlined />} placeholder="用户名" />
                    </Form.Item>

                    {/* 密码 */}
                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                      <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                    </Form.Item>

                    {/* 验证码 */}
                    <Form.Item name="captchaInput" rules={[{ required: true, message: '请输入验证码' }]}>
                      <div style={styles.captchaRow}>
                        <Input prefix={<CodeOutlined />} placeholder="验证码" style={{ flex: 1 }} maxLength={4} />
                        <canvas
                          ref={canvasRef}
                          width={100}
                          height={40}
                          onClick={handleRefreshCaptcha}
                          style={styles.captchaCanvas}
                          title="点击刷新验证码"
                        />
                      </div>
                    </Form.Item>

                    {/* 记住密码 + 忘记密码 */}
                    <Form.Item style={{ marginBottom: 12 }}>
                      <div style={styles.rememberRow}>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                          <Checkbox>记住密码</Checkbox>
                        </Form.Item>
                        <a style={styles.forgotLink} onClick={() => message.info('请联系管理员重置密码')}>
                          忘记密码？
                        </a>
                      </div>
                    </Form.Item>

                    {/* 登录按钮 */}
                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={loading} block style={styles.loginBtn}>
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
                  <Form form={codeForm} onFinish={handleCodeLogin} size="large" autoComplete="off" className="login-underline">
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
                      <div style={styles.captchaRow}>
                        <Input prefix={<SafetyOutlined />} placeholder="短信验证码" style={{ flex: 1 }} maxLength={6} />
                        <Button
                          onClick={handleSendCode}
                          disabled={countdown > 0}
                          style={{ flexShrink: 0, width: 110, borderRadius: 8 }}
                        >
                          {countdown > 0 ? `${countdown}s 后重发` : '发送验证码'}
                        </Button>
                      </div>
                    </Form.Item>

                    {/* 登录按钮 */}
                    <Form.Item style={{ marginTop: 24 }}>
                      <Button type="primary" htmlType="submit" loading={codeLoading} block style={styles.loginBtn}>
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

// 样式对象
const styles: Record<string, React.CSSProperties> = {
  // 整体白底：窗口任意大小都不会再露出紫色背景
  // 注意：容器不能再整体设 WebkitAppRegion: 'drag'——Windows 上 drag 区域
  // 按原生标题栏处理，鼠标事件到不了页面，吉祥物眼睛就无法跟随
  container: {
    height: '100vh',
    display: 'flex',
    background: '#fff',
    position: 'relative',
  },
  // 顶部拖拽条：代替原来的整容器 drag，用于拖动窗口
  dragBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    zIndex: 5,
    WebkitAppRegion: 'drag',
  } as any,
  leftPanel: {
    flex: '0 0 400px',
    background: '#E9E7F7',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  // 面板装饰圆形
  decoCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.35)',
    top: -60,
    left: -60,
  },
  decoCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.28)',
    bottom: -40,
    right: -30,
  },
  decoCircle3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.3)',
    top: 90,
    right: 60,
  },
  panelTitle: {
    marginTop: 28,
    fontSize: 16,
    fontWeight: 600,
    color: '#5a5f7a',
    letterSpacing: 2,
  },
  panelSubtitle: {
    marginTop: 8,
    fontSize: 11,
    color: '#9a9ec0',
    letterSpacing: 3,
  },
  rightPanel: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formWrap: {
    width: 360,
    WebkitAppRegion: 'no-drag',
  } as any,
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: '#1f1f1f',
    margin: 0,
  },
  formSubtitle: {
    fontSize: 13,
    color: '#9aa0ae',
    marginTop: 8,
    marginBottom: 20,
  },
  captchaRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  captchaCanvas: {
    cursor: 'pointer',
    borderRadius: 6,
    border: '1px solid #e3e6ec',
    flexShrink: 0,
  },
  rememberRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: 13,
    color: '#8a94a6',
  },
  loginBtn: {
    height: 46,
    borderRadius: 23,
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: 4,
    background: 'linear-gradient(90deg, #5d8bf4 0%, #6c63ff 100%)',
    border: 'none',
    boxShadow: '0 8px 18px rgba(108, 99, 255, 0.35)',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 28,
    height: 28,
    border: 'none',
    background: 'transparent',
    color: '#999',
    fontSize: 16,
    cursor: 'pointer',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    zIndex: 10,
    WebkitAppRegion: 'no-drag',
  } as any,
}
