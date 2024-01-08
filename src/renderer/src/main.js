import { createApp } from 'vue'
import App from './App.jsx'
import { router } from './router'
import { createPinia } from 'pinia'
import 'ant-design-vue/dist/reset.css'

const store = createPinia()

createApp(App).use(router).use(store).mount('#app')
