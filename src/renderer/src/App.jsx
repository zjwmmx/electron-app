import { ConfigProvider, Progress } from 'ant-design-vue'
import { defineComponent, onMounted } from 'vue'
import { RouterView } from 'vue-router'

const App = defineComponent({
  name: 'App',
  setup: () => {
    console.log(window.electron)
    console.log(window.api)
    console.log(import.meta.env)

    onMounted(() => {
      window.api.onUpdateProgress((progress) => {
        console.log(progress)
      })
    })
    return () => {
      return (
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#00b96b'
            }
          }}
        >
          <Progress type="circle" percent={75} />
          <RouterView />
        </ConfigProvider>
      )
    }
  }
})

export default App
