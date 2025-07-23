import { app, BrowserWindow } from 'electron'
import { logger } from './logger'

// 调试配置
const DEBUG_CONFIG = {
  devTools: process.env.NODE_ENV === 'development',
  debugMode: process.env.DEBUG === 'true',
  performanceMode: process.env.PERFORMANCE === 'true'
}

// 打开开发者工具
function openDevTools(window) {
  try {
    if (DEBUG_CONFIG.devTools) {
      window.webContents.openDevTools()
      logger.info('开发者工具已打开')
    }
  } catch (error) {
    logger.error('打开开发者工具失败', error)
  }
}

// 设置调试模式
function setupDebugMode(window) {
  try {
    if (DEBUG_CONFIG.debugMode) {
      // 启用调试功能
      window.webContents.setDevToolsWebContents(window.webContents)
      window.webContents.setDevToolsHost('localhost')
      
      // 设置调试端口
      window.webContents.debugger.attach('1.1')
      
      logger.info('调试模式已启用')
    }
  } catch (error) {
    logger.error('设置调试模式失败', error)
  }
}

// 设置性能分析
function setupPerformance(window) {
  try {
    if (DEBUG_CONFIG.performanceMode) {
      // 启用性能分析
      window.webContents.setDevToolsWebContents(window.webContents)
      window.webContents.setDevToolsHost('localhost')
      
      // 开始性能分析
      window.webContents.debugger.sendCommand('Performance.enable')
      
      logger.info('性能分析已启用')
    }
  } catch (error) {
    logger.error('设置性能分析失败', error)
  }
}

// 初始化调试支持
export function initDebug(window) {
  openDevTools(window)
  setupDebugMode(window)
  setupPerformance(window)
} 