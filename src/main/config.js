import { app } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { logger } from './logger'
import { deepMerge, safeExecute } from './utils'

// 默认配置
const DEFAULT_CONFIG = {
  // 窗口配置
  windows: {
    login: {
      width: 600,
      height: 670,
      autoHideMenuBar: true
    },
    main: {
      width: 1024,
      height: 768,
      autoHideMenuBar: false
    }
  },
  
  // 快捷键配置
  shortcuts: {
    devTools: 'CommandOrControl+J+K'
  },
  
  // 更新配置
  updates: {
    checkOnStartup: true,
    autoDownload: false,
    autoInstall: false
  },
  
  // 安全配置
  security: {
    webSecurity: false,
    sandbox: false,
    devTools: true
  },
  
  // 日志配置
  logging: {
    level: 'INFO',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5
  }
}

// 配置文件路径
const CONFIG_FILE_PATH = join(app.getPath('userData'), 'config.json')

// 加载配置
function loadConfig() {
  return safeExecute(() => {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8')
      const userConfig = JSON.parse(configData)
      
      // 合并默认配置和用户配置
      const mergedConfig = deepMerge(DEFAULT_CONFIG, userConfig)
      logger.info('Configuration loaded', { config: mergedConfig })
      return mergedConfig
    } else {
      logger.info('No configuration file found, using defaults')
      return DEFAULT_CONFIG
    }
  }, 'loadConfig', DEFAULT_CONFIG)
}

// 保存配置
function saveConfig(config) {
  return safeExecute(() => {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2))
    logger.info('Configuration saved')
  }, 'saveConfig')
}

// 获取配置
export function getConfig() {
  return loadConfig()
}

// 更新配置
export function updateConfig(newConfig) {
  const currentConfig = loadConfig()
  const updatedConfig = deepMerge(currentConfig, newConfig)
  saveConfig(updatedConfig)
  return updatedConfig
}

// 重置配置
export function resetConfig() {
  saveConfig(DEFAULT_CONFIG)
  logger.info('Configuration reset to defaults')
  return DEFAULT_CONFIG
}

export default {
  getConfig,
  updateConfig,
  resetConfig
}