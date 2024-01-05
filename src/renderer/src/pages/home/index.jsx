import { defineComponent, onMounted, ref } from 'vue'
import style from './style.module.scss'
import { useRoute, useRouter } from 'vue-router'

const Home = defineComponent({
  name: 'Home',
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const test = ref('defrer')
    const sendMain = () => {
      // 向主线程发送消息
      window.api.setTitle('你是猪吗')
      // window.api.getTitle('你是猪吗')
      // window.ipcRenderer.send('asynchronous-message', 'pong')
      // const data = window.electron.ipcRenderer.sendSync('asynchronous-message', 'pongsss')
      // console.log(data)
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
      setTimeout(() => {
        test.value = '123'
      }, 3000)
    })
    return () => {
      return (
        <div class={style.wrap}>
          <button onClick={sendMain}>{test.value}</button>
        </div>
      )
    }
  }
})

export default Home
