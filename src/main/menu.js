import { app, Menu } from 'electron'
import { checkForUpdates } from './updater'

export function buildMenu(mainWindow, ipcMain) {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '检查更新',
          click: () => {
            // 处理打开菜单项的点击事件
            checkForUpdates(mainWindow, ipcMain)
          }
        },
        {
          type: 'separator'
        },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            // 退出应用程序
            app.quit() 
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            // 处理关于菜单项的点击事件
          }
        }
      ]
    }
  ]

  // 根据菜单模板创建菜单
  const menu = Menu.buildFromTemplate(template)
  // 将菜单设置为应用程序的主菜单
  Menu.setApplicationMenu(menu)
}
