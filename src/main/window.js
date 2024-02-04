// import { app, BrowserWindow, ipcMain } from 'electron'
// import { join } from 'path'
// import { buildMenu } from './menu'
// import { createTray } from './tray'
// import icon from '../../resources/icon.png?asset'
// import { checkForUpdates } from './updater'

// let loginWindow
// let mainWindow
// let loading

// // 通用创建BrowserWindow的方法
// function createWindow(options, url, preloadPath) {
//   const commonOptions = {
//     show: false,
//     webPreferences: {
//       preload: join(__dirname, preloadPath),
//       sandbox: false,
//       webSecurity: false,
//     },
//   };

//   let win = new BrowserWindow({ ...commonOptions, ...options });

//   if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
//     win.loadURL(process.env['ELECTRON_RENDERER_URL']);
//   } else {
//     win.loadURL(url);
//   }

//   win.once('ready-to-show', () => win.show());

//   return win;
// }

// function showLoading(cb) {
//   loading = new BrowserWindow({
//     show: false,
//     frame: false, // 无边框（窗口、工具栏等），只包含网页内容
//     width: 160,
//     height: 180,
//     resizable: false
//     // transparent: true, // 窗口是否支持透明，如果想做高级效果最好为true
//   })

//   loading.once('show', cb)
//   loading.loadURL(join(__dirname, '../renderer/utils/loading.html'))
//   loading.show()
// }

// function createLoginWindow() {
//   loginWindow = new BrowserWindow({
//     width: 1200,
//     height: 670,
//     autoHideMenuBar: true, // 是否隐藏菜单栏
//     ...(process.platform === 'linux' ? { icon } : {}),
//     // 配置预加载脚本
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false,
//       webSecurity: false
//     }
//   })

//   if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
//     loginWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
//   } else {
//     loginWindow.loadFile(join(__dirname, '../renderer/index.html'))
//   }

//   loginWindow.on('ready-to-show', () => {
//     if (loading) {
//       loading.hide()
//       loading.close()
//       loading = null
//     }
//   })

//   // 加载 /login 路由
//   loginWindow.webContents.on('did-finish-load', () => {
//     console.log('finish')
//     loginWindow.webContents.send('replace', '/login')
//   })

//   ipcMain.on('login', () => {
//     loginWindow.close()
//     createMainWindow()
//   })

//   // 打开调试控制台
//   //     globalShortcut.register('CommandOrControl+Shift+I', () => {
//   //       win.webContents.openDevTools({ mode: 'right' })
//   //     })

//   // 在关闭登录窗口时退出应用程序
//   //   loginWindow.on('closed', () => {
//   //     app.quit()
//   //   })
// }

// function createMainWindow() {
//   mainWindow = new BrowserWindow({
//     width: 800,
//     height: 670,
//     autoHideMenuBar: false, // 是否隐藏菜单栏
//     ...(process.platform === 'linux' ? { icon } : {}),
//     // 配置预加载脚本
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false,
//       webSecurity: false
//     }
//   })

//   if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
//     mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
//   } else {
//     mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
//   }
//   // 打开调试控制台
//   mainWindow.webContents.openDevTools({ mode: 'right' })

//   ipcMain.once('open-window', () => {
//     createMainWindow()
//   })

//   ipcMain.once('logout', () => {
//     mainWindow.close()
//     createLoginWindow()
//   })

//   // 检查更新
//   ipcMain.once('checkUpdate', () => {
//     checkForUpdates(mainWindow, ipcMain)
//   })

//   buildMenu(mainWindow, ipcMain)

//   createTray(mainWindow)
// }

// // 初始化，并准备创建浏览器窗口。
// app.whenReady().then(() => {
//   showLoading(createLoginWindow)
//   // createLoginWindow()
// })

// // 只有当应用程序激活后没有可见窗口时，才能创建新的浏览器窗口。
// app.on('activate', function () {
//   if (BrowserWindow.getAllWindows().length === 0) createLoginWindow()
// })

// // 监听窗口关闭事件，当应用程序不再有任何打开窗口时试图退出。 由于操作系统的 窗口管理行为 ，此监听器在 macOS 上是禁止操作的。
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

// export default {
//   createLoginWindow,
//   createMainWindow
// }
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
