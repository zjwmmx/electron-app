import { app, shell, BrowserWindow, ipcMain, Menu, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { buildMenu } from './menu'

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

  // 打开调试工具
  if (is.dev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.on('did-finish-load', () => {
    // 发送当前时间到渲染进程
    mainWindow?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    // 开发环境，加载开发服务器的URL
    // 可以是远程地址，且不会有跨域影响
    mainWindow.loadURL('https://im-app.qa.lightai.cn/')
    // mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    // 否则加载本地的index.html文件
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  buildMenu(mainWindow, ipcMain)
}

// 初始化，并准备创建浏览器窗口。
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // 只有当应用程序激活后没有可见窗口时，才能创建新的浏览器窗口。
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // ipcMain.handle('dialog:openFile', async () => {
  //   const { canceled, filePaths } = await dialog.showOpenDialog({})
  //   if (!canceled) {
  //     return filePaths[0]
  //   }
  // })
})

// 监听窗口关闭事件，当应用程序不再有任何打开窗口时试图退出。 由于操作系统的 窗口管理行为 ，此监听器在 macOS 上是禁止操作的。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 两种回复方式
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(`主进程监听者1：`, arg)
  // 同步
  event.returnValue = '同步回复？'
  // 异步
  event.reply('asynchronous-reply', '主进程:这是我回复的')
})

ipcMain.on('setTitle', (event, title) => {
  console.log(`主进程监听者接受到你的绘画`, title)
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  win.setTitle(title)
  // ipcMain.reply('getTitle', '我收到了你的绘画')
})
