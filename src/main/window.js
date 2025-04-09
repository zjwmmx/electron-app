import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron'
import { join } from 'path'
import { buildMenu } from './menu'
import { createTray } from './tray'
import icon from '../../resources/icon.png?asset'
import { checkForUpdates } from './updater'
import { logger, handleError } from './logger'
import config from './config'
import { setupUpdateLogHandler } from './log'

// 存储当前活动窗口
let activeWindow = null

// 快捷键注册
function registryShortcut() {
  try {
    const shortcut = config.getConfig().shortcuts.devTools
    // 先注销可能存在的快捷键
    globalShortcut.unregister(shortcut)
    // 注册新的快捷键
    globalShortcut.register(shortcut, () => {
      if (activeWindow && !activeWindow.isDestroyed()) {
        activeWindow.webContents.openDevTools()
      }
    })
    logger.info('Global shortcut registered', { shortcut })
  } catch (error) {
    handleError(error, 'registryShortcut')
  }
}

// 创建基础窗口
function createBaseWindow(windowType) {
  try {
    const windowConfig = config.getConfig().windows[windowType]
    const securityConfig = config.getConfig().security
    
    const baseConfig = {
      show: false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: securityConfig.sandbox,
        webSecurity: securityConfig.webSecurity,
        devTools: securityConfig.devTools
      }
    }

    if (process.platform === 'linux') {
      baseConfig.icon = icon
    }

    const finalConfig = { ...baseConfig, ...windowConfig }
    const win = new BrowserWindow(finalConfig)

    // 加载页面
    if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
      win.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      const htmlPath = join(__dirname, '../renderer/index.html')
      win.loadFile(htmlPath)
    }

    win.once('ready-to-show', () => {
      win.show()
    })

    // 监听窗口激活事件
    win.on('focus', () => {
      activeWindow = win
    })

    // 监听窗口关闭事件
    win.on('closed', () => {
      if (activeWindow === win) {
        activeWindow = null
      }
    })

    logger.info('Window created', { type: windowType, config: finalConfig })
    return win
  } catch (error) {
    handleError(error, 'createBaseWindow')
    return null
  }
}

// 设置登录窗口的IPC事件监听
function setupLoginWindowIPC(win) {
  try {
    // 加载 /login 路由
    win.webContents.on('did-finish-load', () => {
      win.webContents.send('replace', '/login')
    })

    // 监听登录成功事件
    ipcMain.once('login', () => {
      logger.info('Login successful')
      win.close()
      createMainWindow()
    })
  } catch (error) {
    handleError(error, 'setupLoginWindowIPC')
  }
}

// 设置主窗口的IPC事件监听
function setupMainWindowIPC(win) {
  try {
    // 监听窗口打开事件
    ipcMain.once('open-window', () => {
      logger.info('Opening new window')
      createMainWindow()
    })

    // 监听登出事件
    ipcMain.once('logout', () => {
      logger.info('User logged out')
      win.close()
      createLoginWindow()
    })

    // 监听检查更新事件
    ipcMain.on('checkUpdate', () => {
      logger.info('Checking for updates')
      checkForUpdates(win, ipcMain)
    })
    
    // 监听配置更新事件
    ipcMain.on('update-config', (event, newConfig) => {
      logger.info('Updating configuration', { newConfig })
      config.updateConfig(newConfig)
    })
    
    // 监听配置重置事件
    ipcMain.on('reset-config', () => {
      logger.info('Resetting configuration')
      config.resetConfig()
    })
  } catch (error) {
    handleError(error, 'setupMainWindowIPC')
  }
}

// 创建登录窗口
function createLoginWindow() {
  try {
    // 注册全局快捷键
    registryShortcut()
    
    const win = createBaseWindow('login')
    
    if (!win) {
      logger.error('Failed to create login window')
      return null
    }
    
    // 设置IPC事件监听
    setupLoginWindowIPC(win)
    
    logger.info('Login window created')
    return win
  } catch (error) {
    handleError(error, 'createLoginWindow')
    return null
  }
}

// 创建主窗口
function createMainWindow() {
  try {
    const win = createBaseWindow('main')
    
    if (!win) {
      logger.error('Failed to create main window')
      return null
    }
    
    // 设置IPC事件监听
    setupMainWindowIPC(win)

    // 构建菜单和托盘
    buildMenu(win)
    createTray(win)
    
    // 检查更新
    if (config.getConfig().updates.checkOnStartup) {
      logger.info('Checking for updates on startup')
      checkForUpdates(win, ipcMain)
    }
    
    logger.info('Main window created')
    return win
  } catch (error) {
    handleError(error, 'createMainWindow')
    return null
  }
}

// 应用初始化
app.whenReady().then(() => {
  try {
    // 初始化更新日志处理程序
    setupUpdateLogHandler(ipcMain)
    
    // 注册全局快捷键
    registryShortcut()
    
    // 创建登录窗口
    createLoginWindow()
    
    logger.info('Application initialized')
  } catch (error) {
    handleError(error, 'app.whenReady')
  }
})

// 应用激活事件
app.on('activate', () => {
  try {
    if (BrowserWindow.getAllWindows().length === 0) {
      createLoginWindow()
      logger.info('Application activated')
    }
  } catch (error) {
    handleError(error, 'app.activate')
  }
})

// 所有窗口关闭事件
app.on('window-all-closed', () => {
  try {
    if (process.platform !== 'darwin') {
      app.quit()
      logger.info('Application quitting')
    }
  } catch (error) {
    handleError(error, 'app.window-all-closed')
  }
})

// 应用退出时注销所有快捷键
app.on('will-quit', () => {
  try {
    globalShortcut.unregisterAll()
    logger.info('Global shortcuts unregistered')
  } catch (error) {
    handleError(error, 'app.will-quit')
  }
})
