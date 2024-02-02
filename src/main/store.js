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

// 检查键是否存在
ipcMain.on('hasStoreKey', (_, key) => {
  const exists = store.has(key)
  _.returnValue = exists
})

// 删除一个键
ipcMain.on('deleteStoreKey', (_, key) => {
  store.delete(key)
})

// 清除所有缓存
ipcMain.on('clearStore', (_) => {
  store.clear()
})

// 获取所有缓存键值对
ipcMain.on('getStoreAll', (_) => {
  const all = store.store
  _.returnValue = all
})

export default store
