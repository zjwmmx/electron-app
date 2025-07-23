import React from 'react'
import { Form, Input, Button, Card } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import styles from './style.module.scss'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../../store/appStore'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAppStore()

  const onFinish = async (values) => {
    try {
      await login(values)
      // 登录成功后将身份验证状态存储到localStorage，用于路由守卫
      localStorage.setItem('auth', JSON.stringify({ isAuthenticated: true }))
      navigate('/dashboard')
    } catch (error) {
      console.error('登录失败:', error)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard}>
        <h1 className={styles.title}>系统登录</h1>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          className={styles.loginForm}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login 