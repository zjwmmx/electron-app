import { app } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import log from 'electron-log'
import { isNil, debounce } from 'lodash'

export function checkForUpdates(mainWindow, ipcMain) {
  autoUpdater.logger = log
  log.transports.file.level = 'debug'
  autoUpdater.autoDownload = false

  // 未打包时是开发环境
  if (!app.isPackaged) {
    Object.defineProperty(app, 'isPackaged', {
      get: () => true
    })
    autoUpdater.updateConfigPath = path.join(__dirname, '../../app-update.yml')
  }

  function sendUpdateMsg(statusObj) {
    mainWindow.webContents.send('updateStatus', statusObj)
  }

  autoUpdater.on('error', (error) => {
    const errMsg = isNil(error) ? 'unknown' : (error.stack || error).toString()
    sendUpdateMsg({
      status: 'error',
      msg: errMsg
    })
  })

  // 没有更新时触发
  autoUpdater.on('update-not-available', () => {
    sendUpdateMsg({
      status: 'latest',
      msg: '已是最新版本'
    })
  })

  // 有更新时触发
  autoUpdater.on('update-available', () => {
    sendUpdateMsg({
      status: 'update-available',
      msg: '有新版本可更新，是否现在更新?'
    })
  })

  // 下载完成
  autoUpdater.on('update-downloaded', () => {
    sendUpdateMsg({
      status: 'completed',
      msg: '下载完成，重启更新'
    })
  })

  //监听开始检测更新事件
  autoUpdater.on('checking-for-update', function () {
    sendUpdateMsg({
      status: 'checking',
      msg: '监听开始检测更新事件'
    })
  })

  // 下载进度，包含进度百分比、下载速度、已下载字节、总字节等
  autoUpdater.on(
    'download-progress',
    debounce(function (progress) {
      console.log(progress)
      sendUpdateMsg({
        status: 'downloading',
        msg: progress
      })
    }),
    4000
  )

  ipcMain.once('downloadUpdate', (info) => {
    autoUpdater.downloadUpdate()
  })

  ipcMain.on('quitAndInstall', () => {
    autoUpdater.quitAndInstall()
  })

  autoUpdater.checkForUpdates()
}
