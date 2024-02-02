import { app, Tray, Menu, nativeImage } from 'electron'
import path from 'path'

// 托盘
export function createTray(mainWindow) {
  // 创建系统托盘图标
  const trayIcon = nativeImage.createFromPath(path.join(__dirname, '../../resources/icon.png'))
  const tray = new Tray(trayIcon)
  const trayMenuTemplate = [
    {
      label: '显示主窗口',
      click: function () {
        // 你的代码来显示主窗口
      }
    },
    {
      label: '退出',
      click: function () {
        app.quit()
      }
    }
  ]
  const trayMenu = Menu.buildFromTemplate(trayMenuTemplate)

  // 设置托盘菜单
  tray.setContextMenu(trayMenu)
  // 托盘图标点击事件
  tray.on('click', function (event, bounds) {
    // 显示托盘菜单
    tray.popUpContextMenu(trayMenu)
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
  })
  return tray
}
