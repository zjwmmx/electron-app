import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'

const App = defineComponent({
  name: 'App',
  setup: () => {
    console.log(window.electron)
    console.log(window.api)
    console.log(import.meta.env)
    return () => {
      return <RouterView />
    }
  }
})

export default App
