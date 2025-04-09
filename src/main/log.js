import { ipcMain } from 'electron'
import { app as electronApp } from 'electron'
import fs from 'fs'
import path from 'path'
import { logger } from './logger'

console.log('log.js开始执行...')

// 更新日志文件路径
const UPDATE_LOG_PATH = path.join(electronApp.getPath('userData'), 'update.log')
console.log('更新日志文件路径:', UPDATE_LOG_PATH)

// 记录更新日志
function logUpdateEvent(event, data = {}) {
  console.log('记录更新日志:', event, data)
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    event,
    ...data
  }

  fs.appendFileSync(UPDATE_LOG_PATH, JSON.stringify(logEntry) + '\n')
  console.log('更新日志记录完成')
}

// 获取更新日志
export function setupUpdateLogHandler(ipcMain) {
  console.log('开始设置更新日志处理程序...')
  ipcMain.on('update-log', (event, log) => {
    console.log('收到更新日志:', log)
    logger.info('Update log received', { log })
  })
  logger.info('Update log handler setup completed')
  console.log('更新日志处理程序设置完成')
}

export { logUpdateEvent }

console.log('log.js执行完成')
