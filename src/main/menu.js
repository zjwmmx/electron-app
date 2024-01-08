import { app, Menu } from 'electron'
import { checkForUpdates } from './updater'

export function buildMenu(mainWindow, ipcMain) {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          accelerator: 'CmdOrCtrl+N',
          class: 'menu-item',
          click: () => {
            // 处理新建菜单项的点击事件
          }
        },
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            // 处理打开菜单项的点击事件
          }
        },
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
            app.quit() // 退出应用程序
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: '刷新',
          accelerator: 'Ctrl+F5',
          click: () => {
            console.log('333')
            mainWindow.webContents.send('refresh', '刷新页面')
          }
        },
        {
          label: '重做',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: '剪切',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: '复制',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: '粘贴',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
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
