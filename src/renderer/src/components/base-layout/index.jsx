import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'

const BaseLayout = defineComponent({
  name: 'BaseLayout',
  setup: () => {
    return () => {
      return <div class="wrap">
        <RouterView></RouterView>
      </div>
    }
  }
})

export default BaseLayout
