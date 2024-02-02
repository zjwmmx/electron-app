import { defineComponent, ref } from 'vue'
import { NButton, NDivider, NForm, NFormItem, NInput } from 'naive-ui'
import style from './style.module.scss'

const Login = defineComponent({
  name: 'Login',
  setup: () => {
    const formRef = ref()
    const formData = ref({})
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
    async function login() {
      console.log(formData.value)
      await formRef.value?.validate()
      window.api.login()
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
                    login()
                  }
                }}
              />
            </NFormItem>
            <NFormItem>
              <NButton class={style.submit} type={'primary'} onClick={login}>
                登录
              </NButton>
            </NFormItem>
          </NForm>
        </div>
      )
    }
  }
})

export default Login
