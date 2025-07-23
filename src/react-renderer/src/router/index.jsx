import React, { useEffect, useState, useRef } from 'react'
import { Navigate, createBrowserRouter, redirect } from 'react-router-dom'
import Login from '../pages/login'
import Dashboard from '../pages/dashboard'
import AppLayout from '../layouts/app-layout'
import { Layout } from 'antd'
import MdEditor from '../pages/md-editor'
import Designer from '../pages/designer'

const { Content } = Layout

// 布局路由
const AppRoute = ({ Component }) => {
  return (
    <AppLayout>
      <Content className="main-content">
        <Component />
      </Content>
    </AppLayout>
  )
}

// 临时用户管理页面组件
const UserManagement = () => (
  <div style={{ padding: 20, background: '#fff', borderRadius: 4 }}>
    <h2>用户管理</h2>
    <p>这里将展示用户管理功能。</p>
  </div>
)

// 临时系统设置页面组件
const Settings = () => (
  <div style={{ padding: 20, background: '#fff', borderRadius: 4 }}>
    <h2>系统设置</h2>
    <p>这里将展示系统设置功能。</p>
  </div>
)

// 鉴权检查函数
const authCheck = () => {
  // 获取全局状态（同步方式）
  // 注意：在loader中不能直接使用hooks，所以这里使用了一个简单的方式
  // 实际项目中可能需要通过其他方式获取身份验证状态
  const isAuthenticated = JSON.parse(localStorage.getItem('auth') || '{"isAuthenticated": false}').isAuthenticated
  
  if (!isAuthenticated) {
    throw redirect('/login')
  }
  
  return null
}

// 创建路由
const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: <AppRoute Component={Dashboard} />,
    loader: authCheck,
  },
  {
    path: '/user',
    element: <AppRoute Component={MdEditor} />,
    loader: authCheck,
  },
  {
    path: '/settings',
    element: <AppRoute Component={Settings} />,
    loader: authCheck,
  },
  {
    path: '/editor',
    element: <AppRoute Component={MdEditor} />,
    loader: authCheck,
  },
  {
    path: '/designer',
    element: <AppRoute Component={Designer} />,
    loader: authCheck,
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" />,
    loader: authCheck,
  },
  {
    path: '*',
    element: <Navigate to="/login" />,
  }
])

export default router 