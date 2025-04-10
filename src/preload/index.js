import { contextBridge, ipcRenderer } from 'electron'

const api = {
  setTitle: (title) => ipcRenderer.send('setTitle', title),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  downloadUpdate: () => ipcRenderer.send('downloadUpdate'),
  quitAndInstall: () => ipcRenderer.send('quitAndInstall'),

  createWindow: () => ipcRenderer.send('createWindow'),
  checkUpdate: () => ipcRenderer.send('checkUpdate'),

  onMainMessage: (cb) => ipcRenderer.on('refresh', (event, message) => cb(message)),
  onUpdateProgress: (cb) => ipcRenderer.on('onUpdateProgress', (event, message) => cb(message)),
  onUpdateStatus: (cb) => ipcRenderer.on('updateStatus', (event, message) => cb(message)),

  navigate: (cb) => ipcRenderer.on('navigate', (event, path) => cb(path)),
  replace: (cb) => ipcRenderer.on('replace', (event, path) => cb(path)),

  openWindow: (value) => ipcRenderer.send('open-window', value),
  closeWindow: () => ipcRenderer.send('close-window'),
  logout: () => ipcRenderer.send('logout'),
  login: () => ipcRenderer.send('login'),

  updateLog: (value) => ipcRenderer.send('update-log', value),

  getUpdateLogs: () => ipcRenderer.invoke('getUpdateLogs')
}

const browserWindow = {}

// 缓存
const store = {
  setStore: (key, value) => ipcRenderer.send('setStore', key, value),
  getStore: (key) => ipcRenderer.send('getStore', key)
}

// 预加载脚本主要是防止暴露一些底层api，如ipcRenderer等，主线程和渲染进程的通讯主要通过预加载脚本这个中间人来关联，不要直接往渲染进程暴露ipcRenderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', {
      ...api
    })
    contextBridge.exposeInMainWorld('store', {
      ...store
    })
    contextBridge.exposeInMainWorld('browserWindow', {
      ...browserWindow
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // window.electron = electronAPI
  window.api = api
  window.store = store
}
