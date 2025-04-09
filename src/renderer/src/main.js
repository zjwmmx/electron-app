import { createApp } from 'vue'
import App from './App.jsx'
import { router } from './router'
import { createPinia } from 'pinia'
import 'ant-design-vue/dist/reset.css'
import '@mmxzjw/component/dist/index.css'
import Component from '@mmxzjw/component'

console.log(Component)
const store = createPinia()
createApp(App).use(router).use(store).mount('#app')
