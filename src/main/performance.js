import { app, BrowserWindow } from 'electron'
import { logger } from './logger'

// 性能监控配置
const PERFORMANCE_CONFIG = {
  memoryCheckInterval: 60000, // 1分钟
  memoryWarningThreshold: 0.8, // 80%
  performanceCheckInterval: 5000 // 5秒
}

// 监控内存使用
function monitorMemory() {
  try {
    const memoryUsage = process.memoryUsage()
    const heapUsed = memoryUsage.heapUsed / memoryUsage.heapTotal

    if (heapUsed > PERFORMANCE_CONFIG.memoryWarningThreshold) {
      logger.warn('内存使用率过高', {
        heapUsed: `${(heapUsed * 100).toFixed(2)}%`,
        ...memoryUsage
      })
    }

    logger.info('内存使用情况', memoryUsage)
  } catch (error) {
    logger.error('监控内存失败', error)
  }
}

// 监控窗口性能
function monitorWindowPerformance(window) {
  try {
    if (!window || window.isDestroyed()) return

    const metrics = window.webContents.getProcessMemoryInfo()
    logger.info('窗口性能指标', {
      windowId: window.id,
      ...metrics
    })
  } catch (error) {
    logger.error('监控窗口性能失败', error)
  }
}

// 监控CPU使用
function monitorCPU() {
  try {
    const cpuUsage = process.cpuUsage()
    logger.info('CPU使用情况', cpuUsage)
  } catch (error) {
    logger.error('监控CPU失败', error)
  }
}

// 初始化性能监控
export function initPerformance() {
  // 设置内存监控
  setInterval(monitorMemory, PERFORMANCE_CONFIG.memoryCheckInterval)

  // 设置CPU监控
  setInterval(monitorCPU, PERFORMANCE_CONFIG.performanceCheckInterval)

  // 设置窗口性能监控
  app.on('browser-window-created', (event, window) => {
    setInterval(() => monitorWindowPerformance(window), PERFORMANCE_CONFIG.performanceCheckInterval)
  })

  logger.info('性能监控已初始化')
} 