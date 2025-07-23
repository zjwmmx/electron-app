import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { message } from 'antd'

const useAppStore = create(
  immer((set, get) => ({
    // 用户认证状态
    isAuthenticated: false,
    
    // 用户信息
    user: null,
    
    // 应用配置
    config: null,
    
    // 加载状态
    loading: false,
    
    // 初始化应用
    initialize: async () => {
      try {
        set(state => {
          state.loading = true
        })
        
        // 加载配置
        const config = await window.api.getConfig()
        
        set(state => {
          state.config = config
          state.loading = false
        })
      } catch (error) {
        console.error('初始化应用失败', error)
        set(state => {
          state.loading = false
        })
        message.error('初始化应用失败')
      }
    },
    
    // 登录
    login: async (username, password) => {
      try {
        set(state => {
          state.loading = true
        })
        
        // 模拟登录
        if (username === 'admin' && password === 'admin') {
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          set(state => {
            state.isAuthenticated = true
            state.user = {
              username,
              name: '管理员',
              role: 'admin'
            }
            state.loading = false
          })
          
          // 通知主进程登录成功
          window.api.send('login')
          return true
        } else {
          set(state => {
            state.loading = false
          })
          message.error('用户名或密码错误')
          return false
        }
      } catch (error) {
        console.error('登录失败', error)
        set(state => {
          state.loading = false
        })
        message.error('登录失败')
        return false
      }
    },
    
    // 登出
    logout: () => {
      set(state => {
        state.isAuthenticated = false
        state.user = null
      })
      
      // 通知主进程登出
      window.api.logout()
    },
    
    // 更新配置
    updateConfig: async (newConfig) => {
      try {
        set(state => {
          state.loading = true
        })
        
        // 更新配置
        await window.api.updateConfig(newConfig)
        
        set(state => {
          state.config = { ...state.config, ...newConfig }
          state.loading = false
        })
        
        message.success('配置已更新')
        return true
      } catch (error) {
        console.error('更新配置失败', error)
        set(state => {
          state.loading = false
        })
        message.error('更新配置失败')
        return false
      }
    }
  }))
)

export default useAppStore 