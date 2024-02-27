import axios from 'axios'
import { createDiscreteApi } from 'naive-ui'
import cookies from 'js-cookie'
import { userStore } from '../store/user.store'

const { message } = createDiscreteApi(['message'])

const service = axios.create({
  baseURL: 'http://127.0.0.1:3000/',
  timeout: 5000
})

service.interceptors.request.use(
  (config) => {
    const token = cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject()
  }
)

service.interceptors.response.use(
  (response) => {
    console.log(response)
    if (response.data?.code === 0) {
      return Promise.resolve(response.data?.data)
    } else {
      Promise.reject()
    }
  },
  (error) => {
    console.log(error)
    const msg = error.response?.data?.message || '请求出错'
    message.error(msg)
    // 登出
    const store = userStore()
    if (error.response?.status === 401) {
      store.logout()
    }
    return Promise.reject()
  }
)

export default service
