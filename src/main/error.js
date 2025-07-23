import { app, dialog } from 'electron'
import { logger } from './logger'
import { join } from 'path'
import fs from 'fs'

// 错误处理配置
const ERROR_CONFIG = {
  crashReportDir: join(app.getPath('userData'), 'crash-reports'),
  maxCrashReports: 10
}

// 确保崩溃报告目录存在
if (!fs.existsSync(ERROR_CONFIG.crashReportDir)) {
  fs.mkdirSync(ERROR_CONFIG.crashReportDir, { recursive: true })
}

// 生成崩溃报告
function generateCrashReport(error) {
  try {
    const timestamp = new Date().toISOString()
    const reportPath = join(ERROR_CONFIG.crashReportDir, `crash-${timestamp}.json`)
    
    const report = {
      timestamp,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      system: {
        platform: process.platform,
        version: process.version,
        arch: process.arch
      },
      app: {
        version: app.getVersion(),
        name: app.getName()
      }
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    logger.error('崩溃报告已生成', { path: reportPath })
    
    return reportPath
  } catch (error) {
    logger.error('生成崩溃报告失败', error)
    return null
  }
}

// 清理旧崩溃报告
function cleanupCrashReports() {
  try {
    const reports = fs.readdirSync(ERROR_CONFIG.crashReportDir)
      .filter(file => file.startsWith('crash-'))
      .sort()
    
    if (reports.length > ERROR_CONFIG.maxCrashReports) {
      reports.slice(0, reports.length - ERROR_CONFIG.maxCrashReports)
        .forEach(file => {
          fs.unlinkSync(join(ERROR_CONFIG.crashReportDir, file))
        })
    }
  } catch (error) {
    logger.error('清理崩溃报告失败', error)
  }
}

// 显示错误对话框
function showErrorDialog(error) {
  try {
    dialog.showErrorBox(
      '应用程序错误',
      `发生了一个错误：\n\n${error.message}\n\n应用程序将尝试继续运行。`
    )
  } catch (error) {
    logger.error('显示错误对话框失败', error)
  }
}

// 处理未捕获的异常
function handleUncaughtException(error) {
  try {
    logger.error('未捕获的异常', error)
    generateCrashReport(error)
    showErrorDialog(error)
  } catch (error) {
    console.error('处理未捕获异常失败', error)
  }
}

// 处理未处理的Promise拒绝
function handleUnhandledRejection(reason, promise) {
  try {
    logger.error('未处理的Promise拒绝', { reason, promise })
    generateCrashReport(reason)
    showErrorDialog(reason)
  } catch (error) {
    console.error('处理未处理Promise拒绝失败', error)
  }
}

// 初始化错误处理
export function initErrorHandling() {
  // 设置全局错误处理
  process.on('uncaughtException', handleUncaughtException)
  process.on('unhandledRejection', handleUnhandledRejection)
  
  // 设置应用错误处理
  app.on('render-process-gone', (event, webContents, details) => {
    logger.error('渲染进程崩溃', details)
    generateCrashReport(new Error(`渲染进程崩溃: ${details.reason}`))
  })
  
  // 清理旧崩溃报告
  cleanupCrashReports()
  
  logger.info('错误处理已初始化')
} 