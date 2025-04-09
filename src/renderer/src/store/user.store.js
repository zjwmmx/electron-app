import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAuthInfo, signIn } from '@renderer/api/api'

import cookies from 'js-cookie'

export const userStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(null)

  async function login(params) {
    // const res = await signIn(params)
    // token.value = res.token
    // cookies.set('token', res.token)
    window.api.login()
  }

  // 登出的逻辑
  function logout() {
    cookies.remove('token')
    window.api.logout()
  }

  // 获取用户信息的逻辑
  async function getUserInfo() {
    const res = await getAuthInfo()
    console.log(res)
  }

  return {
    userInfo,
    token,
    getUserInfo,
    logout,
    login
  }
})
