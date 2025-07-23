import React, { useEffect, useState } from 'react'
import { Layout, Menu } from 'antd'
import { UserOutlined, DashboardOutlined, SettingOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import useAppStore from '../../store/appStore'
import styles from './style.module.scss'
import { marked } from 'marked'
import 'prismjs/themes/prism.css'
import Prism from 'prismjs'
import 'katex/dist/katex.min.css'
import katex from 'katex'

const { Header, Sider, Content } = Layout

// 敏感词文件名列表（如有新增请补充）
const SENSITIVE_FILES = [
  'danger.txt',
  'huang.txt',
  'other.txt',
  'other1.txt',
  'other2.txt',
  'other3.txt',
  'other4.txt',
  'other5.txt',
  'people.txt',
  'porn.txt',
  'tencent.txt'
]

marked.setOptions({
  highlight: function (code, lang) {
    return Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup, lang)
  }
})

// 支持 $...$ 行内公式和 $$...$$ 块级公式
function renderKatex(md) {
  return md
    .replace(/\\?\\?\\$\\$(.+?)\\$\\$/gs, (match, formula) => {
      try {
        return katex.renderToString(formula, { displayMode: true })
      } catch {
        return match
      }
    })
    .replace(/\\?\\?\\$(.+?)\\$/gs, (match, formula) => {
      try {
        return katex.renderToString(formula, { displayMode: false })
      } catch {
        return match
      }
    })
}

const AppLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAppStore()
  const [sensitiveWords, setSensitiveWords] = useState([])

  // 从路径中获取当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname
    if (path.includes('/dashboard')) return '1'
    if (path.includes('/user')) return '2'
    if (path.includes('/settings')) return '3'
    return '1'
  }

  const handleMenuClick = (key) => {
    switch (key) {
      case '1':
        navigate('/dashboard')
        break
      case '2':
        navigate('/user')
        break
      case '3':
        navigate('/settings')
        break
      case '4':
        navigate('/editor')
        break
      case '5':
        navigate('/designer')
        break
      default:
        navigate('/dashboard')
    }
  }

  const handleLogout = () => {
    logout()
    // 清除localStorage中的身份验证状态
    localStorage.removeItem('auth')
    navigate('/login')
  }

  useEffect(() => {
    console.log('SENSITIVE_FILES', SENSITIVE_FILES)
    Promise.all(
      SENSITIVE_FILES.map((f) =>
        fetch(`/keywords/${f}`)
          .then((res) => (res.ok ? res.text() : ''))
          .catch(() => '')
      )
    ).then((list) => {
      const allWords = list
        .map((txt) => txt.split('\\n').map((w) => w.trim()))
        .flat()
        .filter(Boolean)
      setSensitiveWords(Array.from(new Set(allWords)))
    })
  }, [])

  return (
    <Layout className={styles.appLayout}>
      <Header className={styles.header}>
        <div className={styles.logo}>管理系统</div>
        <div className={styles.userInfo}>
          <span className={styles.welcome}>欢迎, {user?.username || '用户'}</span>
          <span className={styles.logout} onClick={handleLogout}>
            退出
          </span>
        </div>
      </Header>

      <Layout>
        <Sider width={200} className={styles.sider}>
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            style={{ height: '100%', borderRight: 0 }}
            onClick={({ key }) => handleMenuClick(key)}
          >
            <Menu.Item key="1" icon={<DashboardOutlined />}>
              控制面板
            </Menu.Item>
            <Menu.Item key="2" icon={<UserOutlined />}>
              用户管理
            </Menu.Item>
            <Menu.Item key="3" icon={<SettingOutlined />}>
              系统设置
            </Menu.Item>
            <Menu.Item key="4" icon={<SettingOutlined />}>
              编辑器
            </Menu.Item>
            <Menu.Item key="5" icon={<SettingOutlined />}>
              表单设计器
            </Menu.Item>
          </Menu>
        </Sider>

        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
