import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { login } from '../api/authApi'
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
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    // 登录页加载时，确保窗口是登录页大小
    window.electronAPI.resizeWindow(465, 425)
  }, [])


  // 验证码变化时重新绘制
  useEffect(() => {
    if (canvasRef.current) {
      drawCaptcha(canvasRef.current, captcha)
    }
  }, [captcha])

  const handleRefreshCaptcha = () => {
    setCaptcha(generateCaptcha())
  }

  const handleLogin = async (values: { username: string; password: string; captchaInput: string }) => {
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
        message.success('登录成功！')
        localStorage.setItem('sms_token', data.token)
        localStorage.setItem('sms_username', data.username)
        localStorage.setItem('sms_logged_in', 'true')
        window.electronAPI.resizeWindow(1200, 800)
        navigate('/', { replace: true })
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

  return (
    <div style={styles.container}>
      {/* 登录卡片 */}
      <div style={styles.card}>
        <div style={styles.dragBar}>
          <button
            onClick={() => window.electronAPI.closeWindow()}
            style={styles.closeBtn}
            title="关闭"
          >
            ✕
          </button>
        </div>
        {/* 标题 */}
        <h2 style={styles.title}>学生管理系统</h2>

        {/* 登录表单 */}
        <Form form={form} onFinish={handleLogin} size="large" autoComplete="off">
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
              <Input placeholder="验证码" style={{ flex: 1 }} maxLength={4} />
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

          {/* 登录按钮 */}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登 录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

// 样式对象
const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitAppRegion: 'drag',
  }as any,
  card: {
    width: 400,
    padding: '40px 32px',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.15)',
    WebkitAppRegion: 'no-drag',
  }as any,
  title: {
    textAlign: 'center' as const,
    fontSize: 24,
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: 32,
  },
  captchaRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  captchaCanvas: {
    cursor: 'pointer',
    borderRadius: 4,
    border: '1px solid #d9d9d9',
    flexShrink: 0,
  },
  dragBar: {
    height: 30,
    background: 'transparent',
    marginBottom: 8,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
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
    WebkitAppRegion: 'no-drag',
  } as any,

}
