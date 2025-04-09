import { app } from 'electron'
import { join } from 'path'
import fs from 'fs'

// 日志级别
const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
}

// 日志文件路径
const LOG_FILE_PATH = join(app.getPath('userData'), 'app.log')

// 确保日志目录存在
const logDir = app.getPath('userData')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// 格式化日期
function formatDate(date) {
  return date.toISOString()
}

// 直接写入日志到文件，不依赖其他模块
function writeToLogFile(level, message, data = null) {
  try {
    const timestamp = formatDate(new Date())
    let logMessage = `[${timestamp}] [${level}] ${message}`
    
    if (data) {
      if (data instanceof Error) {
        logMessage += `\nError: ${data.message}\nStack: ${data.stack}`
      } else {
        logMessage += `\nData: ${JSON.stringify(data, null, 2)}`
      }
    }
    
    logMessage += '\n'
    
    fs.appendFileSync(LOG_FILE_PATH, logMessage)
  } catch (error) {
    // 使用process.stderr.write直接写入错误信息
    process.stderr.write(`Error writing to log file: ${error.message}\n`)
  }
}

// 简单的日志记录函数，不依赖配置
function log(level, message, data = null) {
  // 直接写入文件
  writeToLogFile(level, message, data)
}

// 导出日志函数
export const logger = {
  debug: (message, data) => log(LOG_LEVELS.DEBUG, message, data),
  info: (message, data) => log(LOG_LEVELS.INFO, message, data),
  warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
  error: (message, data) => log(LOG_LEVELS.ERROR, message, data)
}

// 导出错误处理函数
export function handleError(error, context = '') {
  const errorMessage = context ? `${context}: ${error.message}` : error.message
  // 直接写入错误信息到文件
  writeToLogFile(LOG_LEVELS.ERROR, errorMessage, error)
  return error
}

// 设置全局错误处理
process.on('uncaughtException', (error) => {
  handleError(error, 'Uncaught Exception')
})

process.on('unhandledRejection', (reason, promise) => {
  handleError(reason, 'Unhandled Rejection')
})

// 记录应用启动
// logger.info('Application starting', { config: config.getConfig() }) 