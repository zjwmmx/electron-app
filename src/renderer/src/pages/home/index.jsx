import { defineComponent, onMounted, ref } from 'vue'
import style from './style.module.scss'
import { useRoute, useRouter } from 'vue-router'
import { Button } from 'ant-design-vue'

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

    onMounted(() => {
      console.log('渲染进程挂载')
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
        </div>
      )
    }
  }
})

export default Home
