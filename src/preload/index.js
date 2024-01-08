import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  setTitle: (title) => ipcRenderer.send('setTitle', title),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),

  onMainMessage: (cb) => ipcRenderer.on('refresh', (event, message) => cb(message)),
  onUpdateProgress: (cb) => ipcRenderer.on('onUpdateProgress', (event, message) => cb(message))
}

// 预加载脚本主要是防止暴露一些底层api，如ipcRenderer等，主线程和渲染进程的通讯主要通过预加载脚本这个中间人来关联，不要直接往渲染进程暴露ipcRenderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', {
      ...api
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
