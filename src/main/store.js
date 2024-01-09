import { ipcMain } from 'electron'
import Store from 'electron-store'

const store = new Store()

// 设置缓存
ipcMain.on('setStore', (_, key, value) => {
  store.set(key, value)
})

// 获取缓存
ipcMain.on('getStore', (_, key) => {
  let value = store.get(key)
  _.returnValue = value || ''
})


export default store
