import { app, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import log from 'electron-log'



// autoUpdater.autoDownload = false

// // 未打包时是开发环境
// if (!app.isPackaged) {
//   Object.defineProperty(app, 'isPackaged', {
//     get: () => true
//   })
//   console.log(__dirname)
//   autoUpdater.updateConfigPath = path.join(__dirname, '../../app-update.yml')
// }

// autoUpdater.on('error', (error) => {
//   console.log('验证更新')
//   dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString())
// })

// // 没有更新时触发
// autoUpdater.on('update-not-available', () => {
//   dialog.showMessageBox({
//     title: '软件无更新',
//     message: '当前已是最新版本，无需更新。'
//   })
// })

// // 3. 有更新时触发
// autoUpdater.on('update-available', () => {
//   dialog
//     .showMessageBox({
//       type: 'info',
//       title: '软件更新',
//       message: '有新版本可更新，是否现在更新?',
//       buttons: ['立即更新', '暂不更新']
//     })
//     .then(() => {
//       autoUpdater.downloadUpdate()
//     })
// })

// autoUpdater.on('update-downloaded', () => {
//   dialog
//     .showMessageBox({
//       title: '下载完成',
//       message: '更新包已下载, 程序将会退出更新...'
//     })
//     .then(() => {
//       setImmediate(() => autoUpdater.quitAndInstall())
//     })
// })

// 8. 下载进度，包含进度百分比、下载速度、已下载字节、总字节等
// ps: 调试时，想重复更新，会因为缓存导致该事件不执行，下载直接完成，可找到C:\Users\40551\AppData\Local\xxx-updater\pending下的缓存文件将其删除（这是我本地的路径）
// autoUpdater.on("download-progress", function (progressObj) {
//   printUpdaterMessage('downloadProgress');
//   mainWindow.webContents.send("downloadProgress", progressObj);
// });

// // 将日志在渲染进程里面打印出来
// function printUpdaterMessage(arg) {
//   let message = {
//     error: "更新出错",
//     checking: "正在检查更新",
//     updateAvailable: "检测到新版本",
//     downloadProgress: "下载中",
//     updateNotAvailable: "无新版本",
//   };
//   mainWindow.webContents.send("printUpdaterMessage", message[arg]??arg);
// }

export function checkForUpdates(mainWindow, ipcMain) {
  autoUpdater.logger = log
  log.transports.file.level = "debug"
  autoUpdater.autoDownload = false

  // 未打包时是开发环境
  if (!app.isPackaged) {
    Object.defineProperty(app, 'isPackaged', {
      get: () => true
    })
    autoUpdater.updateConfigPath = path.join(__dirname, '../../app-update.yml')
  }

  autoUpdater.on('error', (error) => {
    console.log('error')
    console.log(error)
    dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString())
  })

  // 没有更新时触发
  autoUpdater.on('update-not-available', () => {
    dialog.showMessageBox({
      title: '软件无更新',
      message: '当前已是最新版本，无需更新。'
    })
  })

  // 3. 有更新时触发
  autoUpdater.on('update-available', () => {
    dialog
      .showMessageBox({
        type: 'info',
        title: '软件更新',
        message: '有新版本可更新，是否现在更新?',
        buttons: ['立即更新', '暂不更新']
      })
      .then(() => {
        autoUpdater.downloadUpdate()
      })
  })

  autoUpdater.on('update-downloaded', () => {
    dialog
      .showMessageBox({
        title: '下载完成',
        message: '更新包已下载, 程序将会退出更新...'
      })
      .then(() => {
        setImmediate(() => autoUpdater.quitAndInstall())
      })
  })

  ipcMain.on('downloadUpdate', () => {
    autoUpdater.downloadUpdate()
  })

  // 8. 下载进度，包含进度百分比、下载速度、已下载字节、总字节等
  autoUpdater.on('download-progress', function (progress) {
    console.log(progress)
    printUpdaterMessage('downloadProgress')
    mainWindow.webContents.send('onUpdateProgress', progress)
  })

  // 将日志在渲染进程里面打印出来
  function printUpdaterMessage(arg) {
    let message = {
      error: '更新出错',
      checking: '正在检查更新',
      updateAvailable: '检测到新版本',
      downloadProgress: '下载中',
      updateNotAvailable: '无新版本'
    }
    mainWindow.webContents.send('printUpdaterMessage', message[arg] ?? arg)
  }

  autoUpdater.checkForUpdates()
}
