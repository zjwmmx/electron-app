import React, { useEffect, useState } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, theme } from 'antd'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import useAppStore from '../store/appStore'
import './AppLayout.css'

const { Header, Sider, Content } = Layout

const AppLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAppStore()
  const [collapsed, setCollapsed] = useState(false)
  const { token } = theme.useToken()

  // 菜单项
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置'
    }
  ]

  // 用户菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录'
    }
  ]

  // 处理菜单点击
  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout()
    } else if (key === 'profile') {
      navigate('/profile')
    }
  }

  // 检查更新
  const checkUpdate = () => {
    window.electron.ipcRenderer.send('checkUpdate')
  }

  // 监听主题色更新
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', token.colorPrimary)
  }, [token.colorPrimary])

  return (
    <Layout className="app-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={220}
        theme="light"
        className="app-sider"
      >
        <div className="logo">
          {!collapsed && <span>Electron React</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      
      <Layout>
        <Header className="app-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="trigger-btn"
          />
          
          <div className="header-right">
            <Button onClick={checkUpdate} type="link">检查更新</Button>
            
            <Dropdown 
              menu={{ 
                items: userMenuItems, 
                onClick: handleUserMenuClick 
              }} 
              placement="bottomRight"
            >
              <div className="user-info">
                <Avatar icon={<UserOutlined />} />
                {user && <span className="username">{user.name}</span>}
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="app-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout 