import { session } from 'electron'
import { logger } from './logger'

// CSP配置
const CSP_POLICY = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:'],
  connectSrc: ["'self'", 'https:'],
  fontSrc: ["'self'", 'data:'],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"]
}

// 设置CSP
function setupCSP() {
  try {
    const cspString = Object.entries(CSP_POLICY)
      .map(([key, value]) => `${key} ${value.join(' ')}`)
      .join('; ')

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [cspString]
        }
      })
    })

    logger.info('CSP策略已设置')
  } catch (error) {
    logger.error('设置CSP失败', error)
  }
}

// 设置沙箱
function setupSandbox() {
  try {
    // 禁用危险功能
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      const allowedPermissions = ['media', 'geolocation']
      callback(allowedPermissions.includes(permission))
    })

    // 禁用危险API
    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
      const blockedPermissions = []
      return !blockedPermissions.includes(permission)
    })

    logger.info('沙箱配置已设置')
  } catch (error) {
    logger.error('设置沙箱失败', error)
  }
}

// 初始化安全配置
export function initSecurity() {
  setupCSP()
  setupSandbox()
} 