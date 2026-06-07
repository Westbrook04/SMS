import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom'
import { Layout, Menu, Button, theme } from 'antd'
import {
  TeamOutlined,
  BookOutlined,
  LogoutOutlined,
  PoweroffOutlined,
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

// 登录状态 key
const LOGIN_KEY = 'sms_logged_in'

export function checkAuth(): boolean {
  // 必须同时有登录标记 和 token，才算已登录（过滤掉旧版模拟登录的残留数据）
  return localStorage.getItem(LOGIN_KEY) === 'true'
      && localStorage.getItem('sms_token') !== null
}

function setLoggedIn() {
  localStorage.setItem(LOGIN_KEY, 'true')
}

function clearAuth() {
  localStorage.removeItem(LOGIN_KEY)
  localStorage.removeItem('sms_token')
  localStorage.removeItem('sms_username')
}

export { setLoggedIn, clearAuth }

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()
  const [checking, setChecking] = useState(true)

  // 未登录则跳回登录页
  useEffect(() => {
    if (!checkAuth()) {
      navigate('/login', { replace: true })
    } else {
      setChecking(false)
      window.electronAPI.resizeWindow(1200, 800)
    }
  }, [navigate])

  // 还没确认登录状态，不渲染页面（防止闪一下）
  if (checking) return null

  // 当前选中的菜单项
  const selectedKey = location.pathname.startsWith('/students')
    ? 'students'
    : 'classes'

  const handleLogout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  const menuItems = [
    {
      key: 'classes',
      icon: <BookOutlined />,
      label: <NavLink to="/classes">班级管理</NavLink>,
    },
    {
      key: 'students',
      icon: <TeamOutlined />,
      label: <NavLink to="/students">学生管理</NavLink>,
    },
  ]

  return (
    <Layout style={{ height: '100vh' }}>
      {/* 左侧栏 */}
      <Sider
        width={220}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        {/* Logo / 标题区域 */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
            color: token.colorPrimary,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          学生管理系统
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ borderInlineEnd: 'none' }}
        />
      </Sider>

      <Layout>
        {/* 顶部栏 */}
        <Header
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 24px',
            height: 64,
          }}
        >
          <Button
            type="text"
            icon={<PoweroffOutlined />}
            onClick={() => window.electronAPI.closeWindow()}
          >
            退出程序
          </Button>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ marginLeft: 8 }}
          >
            退出登录
          </Button>
        </Header>

        {/* 内容区 */}
        <Content
          style={{
            padding: 24,
            overflow: 'auto',
            background: token.colorBgLayout,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
