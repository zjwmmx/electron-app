import { ConfigProvider } from 'ant-design-vue'
import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'

const App = defineComponent({
  name: 'App',
  setup: () => {
    console.log(import.meta.env)

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
