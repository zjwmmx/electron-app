import { ipcMain } from 'electron'
import { app as electronApp } from 'electron'
import fs from 'fs'
import path from 'path'
import { logger, handleError } from './logger'

// 更新日志文件路径
const UPDATE_LOG_PATH = path.join(electronApp.getPath('userData'), 'update.log')

// 确保日志目录存在
const logDir = electronApp.getPath('userData')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// 写入更新日志
export function writeUpdateLog(message) {
  try {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}\n`
    fs.appendFileSync(UPDATE_LOG_PATH, logMessage)
    logger.info('更新日志已写入', { message })
  } catch (error) {
    handleError(error, '写入更新日志失败')
  }
}

// 读取更新日志
export async function getUpdateLogs() {
  try {
    if (!fs.existsSync(UPDATE_LOG_PATH)) {
      return []
    }
    const content = fs.readFileSync(UPDATE_LOG_PATH, 'utf-8')
    const logs = content.split('\n').filter(line => line.trim())
    logger.info('更新日志已读取', { count: logs.length })
    return logs
  } catch (error) {
    handleError(error, '读取更新日志失败')
    return []
  }
}

// 设置更新日志处理程序
export function setupUpdateLogHandler(ipcMain) {
  try {
    ipcMain.on('update-log', (event, message) => {
      writeUpdateLog(message)
    })
    logger.info('更新日志处理程序已设置')
  } catch (error) {
    handleError(error, '设置更新日志处理程序失败')
  }
}
