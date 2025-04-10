import { app } from 'electron'
import { join } from 'path'
import fs from 'fs'
import config from './config'

// 日志级别
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO'
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
    process.stderr.write(`Error writing to log file: ${error.message}\n`)
  }
}

// 简单的日志记录函数，不依赖配置
function log(level, message, data = null) {
  writeToLogFile(level, message, data)
}

// 导出日志函数
export const logger = {
  error: (message, data) => log(LOG_LEVELS.ERROR, message, data),
  warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
  info: (message, data) => log(LOG_LEVELS.INFO, message, data)
}

// 导出错误处理函数
export function handleError(error, context = '') {
  const errorMessage = context ? `${context}: ${error.message}` : error.message
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
logger.info('Application starting', { config: config.getConfig() }) 