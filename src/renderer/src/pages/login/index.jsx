import { defineComponent, ref } from 'vue'
import { NButton, NDivider, NForm, NFormItem, NInput } from 'naive-ui'
import style from './style.module.scss'
import { useMessage } from 'naive-ui/es'
import { register } from '@renderer/api/api'
import { userStore } from '../../store/user.store'
import { storeToRefs } from 'pinia'

const Login = defineComponent({
  name: 'Login',
  setup: () => {
    const formRef = ref()
    const formData = ref({})
    const store = userStore()
    const message = useMessage()
    const rules = {
      username: {
        required: true,
        message: '请输入姓名',
        trigger: 'change'
      },
      password: {
        required: true,
        message: '请输入密码',
        trigger: 'change'
      }
    }
    async function handleLogin() {
      await formRef.value?.validate()
      // 调用主进程的登录方法
      const params = {
        username: formData.value.username,
        password: formData.value.password
      }
      await store.login(params)
      message.success('登录成功')
    }

    async function handleRegister() {
      await formRef.value?.validate()
      // 调用主进程的登录方法
      const params = {
        username: formData.value.username,
        password: formData.value.password
      }
      await register(params)
      message.success('注册成功')
    }

    return () => {
      return (
        <div class={style.wrap}>
          <NForm class={style.form} ref={formRef} model={formData.value} rules={rules}>
            <NFormItem class={style.title}>
              <NDivider>
                <h2>登录认证</h2>
              </NDivider>
            </NFormItem>
            <NFormItem label="用户名" path="username">
              <NInput
                type="text"
                v-model:value={formData.value.username}
                placeholder={'请输入用户名'}
              />
            </NFormItem>
            <NFormItem label="密码" path="password">
              <NInput
                type="password"
                v-model:value={formData.value.password}
                placeholder={'请输入密码'}
                onKeyup={(e) => {
                  if (e.keyCode === 13) {
                    handleLogin()
                  }
                }}
              />
            </NFormItem>
            <NFormItem>
              <div class={style.btns}>
                <NButton class={style.submit} type={'primary'} onClick={handleLogin}>
                  登录
                </NButton>
                <NButton class={style.submit} onClick={handleRegister}>
                  注册
                </NButton>
              </div>
            </NFormItem>
          </NForm>
        </div>
      )
    }
  }
})

export default Login
