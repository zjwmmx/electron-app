import { defineComponent, onMounted, ref } from 'vue'
import style from './style.module.scss'
import { useRoute, useRouter } from 'vue-router'
import { Button, Modal } from 'ant-design-vue'
import localforage from 'localforage'

const Home = defineComponent({
  name: 'Home',
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const test = ref('修改title')
    const storageData = ref('')
    const forageData = ref('')
    const currentStatus = ref(null)
    
    function sendMain() {
      // 向主线程发送消息
      window.api.setTitle('你是猪吗')
      // window.api.getTitle('你是猪吗')
      // window.ipcRenderer.send('asynchronous-message', 'pong')
      // const data = window.electron.ipcRenderer.sendSync('asynchronous-message', 'pongsss')
      // console.log(data)
    }

    function createWindow() {
      window.api.createWindow()
    }

    function setLocalStorage() {
      localStorage.setItem('test', '123')
    }

    function setLocalForage() {
      localforage.setItem('test3333', '333333333333333333333')
    }

    function openWindow() {
      window.api.openWindow('mainWindow')
    }

    function logout() {
      window.api.logout()
    }

    function closeWindow() {
      window.api.closeWindow()
    }

    function handleCheckUpdate() {
      if (['checking', 'downloading', 'pending'].includes(currentStatus.value)) {
        Modal.warning({
          title: '提示',
          content: '正在检查或下载更新，请稍候...'
        })
        return
      }
      window.api.checkUpdate()
    }

    function closeandOpenWindow() {
      openWindow()
      closeWindow()
    }

    onMounted(async () => {
      console.log('渲染进程挂载')
      storageData.value = localStorage.getItem('test')
      forageData.value = await localforage.getItem('test3333')
      console.log('test', localStorage.getItem('test'))
      console.log('test3333', localforage.getItem('test'))
      // window.api.getTitle()
      window.api.onMainMessage((msg) => {
        console.log(msg)
        console.log(route)
        console.log(router)
        router.go(0)
      })

      window.api.onUpdateStatus(({ status }) => {
        currentStatus.value = status
      })
    })
    return () => {
      return (
        <div class={style.wrap}>
          <Button type={'primary'} onClick={handleCheckUpdate}>
            检查更新
          </Button>
          <Button type={'primary'} onClick={createWindow}>
            打开新窗口
          </Button>
          <Button type={'primary'} onClick={setLocalStorage}>
            设置本地缓存
          </Button>
          <Button type={'primary'} onClick={setLocalForage}>
            设置本地缓存localForage
          </Button>
          <Button type={'primary'} onClick={openWindow}>
            打开新窗口
          </Button>
          <Button type={'primary'} onClick={logout}>
            登出
          </Button>
          <div>localStorage: {storageData.value}</div>
          <div>localforage：{forageData.value}</div>
        </div>
      )
    }
  }
})

export default Home
