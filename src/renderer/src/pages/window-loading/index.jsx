import { defineComponent } from 'vue'
import { NSpin } from 'naive-ui'

const WindowLoading = defineComponent({
  name: 'WindowLoading',
  setup: () => {
    return () => {
      return (
        <div class="wrap">
          <NSpin size="large" />
        </div>
      )
    }
  }
})

export default WindowLoading
