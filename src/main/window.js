import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { buildMenu } from './menu'
import icon from '../../resources/icon.png?asset'

let loginWindow
let mainWindow

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 1200,
    height: 670,
    autoHideMenuBar: true, // 是否隐藏菜单栏
    ...(process.platform === 'linux' ? { icon } : {}),
    // 配置预加载脚本
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    loginWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/login`)
  } else {
    loginWindow.loadFile(join(__dirname, '../renderer/index.html/#/login'))
  }

  ipcMain.on('login', () => {
    loginWindow.close()
    createMainWindow()
  })

  // 打开调试控制台
//     globalShortcut.register('CommandOrControl+Shift+I', () => {
//       win.webContents.openDevTools({ mode: 'right' })
//     })

  // 在关闭登录窗口时退出应用程序
  //   loginWindow.on('closed', () => {
  //     app.quit()
  //   })
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 670,
    autoHideMenuBar: false, // 是否隐藏菜单栏
    ...(process.platform === 'linux' ? { icon } : {}),
    // 配置预加载脚本
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // mainWindow.loadFile('index.html')

  // 在主页窗口中打开新的窗口
  //   mainWindow.webContents.on('open-new-window', () => {
  //     createMainWindow()
  //   })

  ipcMain.on('open-window', () => {
    createMainWindow()
  })

  ipcMain.on('logout', () => {
    mainWindow.close()
    createLoginWindow()
  })

  buildMenu(mainWindow, ipcMain)

  // 在主页窗口中返回登录窗口
  //   mainWindow.webContents.on('logout', () => {
  //     mainWindow.close()
  //     createLoginWindow()
  //   })

  // 在关闭主页窗口时退出应用程序
  //   mainWindow.on('closed', () => {
  //     app.quit()
  //   })
}

// 初始化，并准备创建浏览器窗口。
app.whenReady().then(() => {
  createLoginWindow()
})

// 只有当应用程序激活后没有可见窗口时，才能创建新的浏览器窗口。
app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createLoginWindow()
})

// 监听窗口关闭事件，当应用程序不再有任何打开窗口时试图退出。 由于操作系统的 窗口管理行为 ，此监听器在 macOS 上是禁止操作的。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

export default {
  createLoginWindow,
  createMainWindow
}
