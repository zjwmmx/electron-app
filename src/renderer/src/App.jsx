import { ConfigProvider } from 'ant-design-vue'
import { defineComponent, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'

const App = defineComponent({
  name: 'App',
  setup: () => {
    console.log(import.meta.env)
    const router = useRouter()

    onMounted(() => {
      window.api.replace((path) => {
        console.log('replace', path)
        router.replace(path)
      })
      window.api.navigate((path) => {
        router.push(path)
      })
    })

    return () => {
      return (
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: 'red'
            }
          }}
        >
          <RouterView />
        </ConfigProvider>
      )
    }
  }
})

export default App
