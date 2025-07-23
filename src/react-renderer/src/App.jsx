import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import useAppStore from './store/appStore'
import router from './router'
import './App.css'

function App() {
  const { initialize } = useAppStore()
  
  useEffect(() => {
    // 初始化应用状态
    initialize()
    
    // 监听窗口事件
    window.api.replace((route) => {
      window.location.hash = route
    })
    
    // return () => {
    //   window.api.removeAllListeners('replace')
    // }
  }, [initialize])
  
  return <RouterProvider router={router} />
}

export default App 