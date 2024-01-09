import { app, shell, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { buildMenu } from './menu'
import icon from '../../resources/icon.png?asset'

function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 670,
    show: false,
    autoHideMenuBar: false, // 是否隐藏菜单栏
    ...(process.platform === 'linux' ? { icon } : {}),
    // 配置预加载脚本
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 发送当前时间到渲染进程
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 开发环境，加载开发服务器的URL
  // 可以是远程地址，且不会有跨域影响
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    // mainWindow.loadURL('https://im-app.qa.lightai.cn/')
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    // 否则加载本地的index.html文件
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 注册快捷键
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    // 打开控制台
    mainWindow.webContents.openDevTools({ mode: 'right' })
  })

  buildMenu(mainWindow, ipcMain)
}

// 初始化，并准备创建浏览器窗口。
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // 只有当应用程序激活后没有可见窗口时，才能创建新的浏览器窗口。
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 监听窗口关闭事件，当应用程序不再有任何打开窗口时试图退出。 由于操作系统的 窗口管理行为 ，此监听器在 macOS 上是禁止操作的。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('createWindow', () => {
  createWindow()
})
