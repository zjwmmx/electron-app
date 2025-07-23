import React from 'react'
import { Typography } from 'antd'
import styles from './style.module.scss'

const { Title } = Typography

const Dashboard = () => {
  return (
    <div className={styles.dashboardContainer}>
      <Title level={4}>控制面板</Title>
      <div className={styles.contentCard}>
        <p>欢迎使用管理系统</p>
        <p>这里是系统的主控制面板，您可以查看重要指标和系统状态。</p>
      </div>
    </div>
  )
}

export default Dashboard 