import { defineComponent, onMounted, ref } from 'vue'
import style from './style.module.scss'
import { useRoute, useRouter } from 'vue-router'
import { Button } from 'ant-design-vue'
import localforage from 'localforage'

const Home = defineComponent({
  name: 'Home',
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const test = ref('修改title')
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

    onMounted(() => {
      console.log('渲染进程挂载')
      console.log('test', localStorage.getItem('test'))
      console.log('test3333', localforage.getItem('test'))
      // window.api.getTitle()
      window.api.onMainMessage((msg) => {
        console.log(msg)
        console.log(route)
        console.log(router)
        router.go(0)
      })
    })
    return () => {
      return (
        <div class={style.wrap}>
          <Button type={'primary'} onClick={sendMain}>
            {test.value}
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
        </div>
      )
    }
  }
})

export default Home
