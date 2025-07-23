import { app } from 'electron'
import { join } from 'path'
import fs from 'fs'
import dayjs from 'dayjs'
import { getConfig } from './config'
import { ipcMain } from 'electron'

// 日志级别
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO'
}

// 日志文件路径
const LOG_FILE_PATH = join(app.getPath('userData'), 'app.log')

// 日志配置
const LOG_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  compressOldLogs: true,
  maxLogAge: 30 * 24 * 60 * 60 * 1000 // 30天
}

// 确保日志目录存在
const logDir = app.getPath('userData')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// 格式化日期
function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss.SSS')
}

// 解析日志行
function parseLogLine(line) {
  const match = line.match(/\[(.*?)\] \[(.*?)\] (.*)/)
  if (!match) return null

  const [, timestamp, level, message] = match
  return {
    timestamp,
    level,
    message,
    raw: line
  }
}

// 查询日志
function queryLogs(options = {}) {
  try {
    const {
      startTime,
      endTime,
      level,
      keyword,
      limit = 1000
    } = options

    const logs = []
    let count = 0

    // 读取当前日志文件
    if (fs.existsSync(LOG_FILE_PATH)) {
      const content = fs.readFileSync(LOG_FILE_PATH, 'utf-8')
      const lines = content.split('\n').filter(line => line.trim())

      for (const line of lines) {
        const log = parseLogLine(line)
        if (!log) continue

        // 应用过滤条件
        if (startTime && dayjs(log.timestamp).isBefore(dayjs(startTime))) continue
        if (endTime && dayjs(log.timestamp).isAfter(dayjs(endTime))) continue
        if (level && log.level !== level) continue
        if (keyword && !log.message.includes(keyword)) continue

        logs.push(log)
        count++

        if (count >= limit) break
      }
    }

    // 读取历史日志文件
    for (let i = 1; i <= LOG_CONFIG.maxFiles; i++) {
      const filePath = `${LOG_FILE_PATH}.${i}`
      if (!fs.existsSync(filePath)) continue

      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n').filter(line => line.trim())

      for (const line of lines) {
        const log = parseLogLine(line)
        if (!log) continue

        // 应用过滤条件
        if (startTime && dayjs(log.timestamp).isBefore(dayjs(startTime))) continue
        if (endTime && dayjs(log.timestamp).isAfter(dayjs(endTime))) continue
        if (level && log.level !== level) continue
        if (keyword && !log.message.includes(keyword)) continue

        logs.push(log)
        count++

        if (count >= limit) break
      }

      if (count >= limit) break
    }

    return logs
  } catch (error) {
    console.error('查询日志失败:', error)
    return []
  }
}

// 检查日志文件大小
function checkLogFileSize() {
  try {
    if (fs.existsSync(LOG_FILE_PATH)) {
      const stats = fs.statSync(LOG_FILE_PATH)
      if (stats.size > LOG_CONFIG.maxFileSize) {
        rotateLogFiles()
      }
    }
  } catch (error) {
    console.error('检查日志文件大小失败:', error)
  }
}

// 清理旧日志文件
function cleanupOldLogs() {
  try {
    const files = fs.readdirSync(logDir)
      .filter(file => file.startsWith('app.log.'))
      .sort((a, b) => {
        const numA = parseInt(a.split('.').pop())
        const numB = parseInt(b.split('.').pop())
        return numB - numA
      })

    // 删除超出最大文件数量的旧日志
    if (files.length > LOG_CONFIG.maxFiles) {
      files.slice(LOG_CONFIG.maxFiles).forEach(file => {
        fs.unlinkSync(join(logDir, file))
      })
    }

    // 删除超过最大年龄的日志文件
    const now = Date.now()
    files.forEach(file => {
      const filePath = join(logDir, file)
      const stats = fs.statSync(filePath)
      if (now - stats.mtimeMs > LOG_CONFIG.maxLogAge) {
        fs.unlinkSync(filePath)
      }
    })
  } catch (error) {
    console.error('清理旧日志文件失败:', error)
  }
}

// 轮转日志文件
function rotateLogFiles() {
  try {
    cleanupOldLogs()

    // 重命名现有的日志文件
    for (let i = LOG_CONFIG.maxFiles - 1; i >= 1; i--) {
      const oldPath = `${LOG_FILE_PATH}.${i}`
      const newPath = `${LOG_FILE_PATH}.${i + 1}`
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath)
      }
    }

    // 重命名当前日志文件
    if (fs.existsSync(LOG_FILE_PATH)) {
      fs.renameSync(LOG_FILE_PATH, `${LOG_FILE_PATH}.1`)
    }
  } catch (error) {
    console.error('轮转日志文件失败:', error)
  }
}

// 写入日志到文件
function writeToLogFile(level, message, data = null) {
  try {
    checkLogFileSize()
    
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
    console.error('写入日志失败:', error)
  }
}

// 日志记录函数
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
  handleError(error, '未捕获的异常')
})

process.on('unhandledRejection', (reason, promise) => {
  handleError(reason, '未处理的Promise拒绝')
})

// 设置日志查询处理程序
ipcMain.handle('queryLogs', async (event, options) => {
  return queryLogs(options)
})

// 记录应用启动
logger.info('Application starting', { config: getConfig() }) 