import './window'
import './log'
import './config'
import './logger'
import './security'
import './performance'
import './debug'
import './error'
import './tray'
import './menu'
import './updater'
import { app, BrowserWindow, ipcMain, clipboard } from 'electron'

// 处理剪贴板相关的 IPC 事件
ipcMain.handle('clipboard:writeText', async (event, text) => {
  clipboard.writeText(text)
})

ipcMain.handle('clipboard:readText', async () => {
  return clipboard.readText()
})