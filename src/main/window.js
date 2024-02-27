import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron'
import { join } from 'path'
import { buildMenu } from './menu'
import { createTray } from './tray'
import icon from '../../resources/icon.png?asset'
import { checkForUpdates } from './updater'

// 快捷键注册
function registryShortcut() {
  globalShortcut.register('CommandOrControl+J+K', () => {
    // 获取当前窗口
    BrowserWindow.getFocusedWindow().webContents.openDevTools()
  })
}

let loginWindow
let mainWindow

function createWindow(config, url) {
  const baseConfig = {
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false,
      // nodeIntegration: true, // 根据需要设置
      // contextIsolation: false, // 根据需要设置
      devTools: true
    }
  }

  if (process.platform === 'linux') {
    baseConfig.icon = icon
  }

  const finalConfig = { ...baseConfig, ...config }
  const win = new BrowserWindow(finalConfig)

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(url)
  }

  win.once('ready-to-show', () => win.show())

  return win
}

function createLoginWindow() {
  loginWindow = createWindow(
    {
      width: 600,
      height: 670,
      autoHideMenuBar: true
    },
    join(__dirname, '../renderer/index.html')
  )

  // 加载 /login 路由
  loginWindow.webContents.on('did-finish-load', () => {
    loginWindow.webContents.send('replace', '/login')
  })

  ipcMain.once('login', () => {
    loginWindow.close()
    createMainWindow()
  })
}

function createMainWindow() {
  mainWindow = createWindow(
    {
      width: 1024,
      height: 768,
      autoHideMenuBar: false
    },
    join(__dirname, '../renderer/index.html')
  )

  ipcMain.once('open-window', () => {
    createMainWindow()
  })

  ipcMain.once('logout', () => {
    mainWindow.close()
    createLoginWindow()
  })

  // 检查更新
  ipcMain.on('checkUpdate', () => {
    console.log('check for updates')
    checkForUpdates(mainWindow, ipcMain)
  })

  buildMenu(mainWindow)
  createTray(mainWindow)
}

app.whenReady().then(() => {
  createLoginWindow()
  // 注册快捷键
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    registryShortcut()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createLoginWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

export default {
  createLoginWindow,
  createMainWindow
}
