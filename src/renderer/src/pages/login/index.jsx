import { defineComponent } from 'vue'
import style from './style.module.scss'
import { Button } from 'ant-design-vue'

const Login = defineComponent({
  name: 'Login',
  setup: () => {
    function login() {
      console.log('login')
      window.browserWindow.login()
    }
    return () => {
      return (
        <div class={style.wrap}>
          <Button type={'primary'} onClick={login}>
            登录
          </Button>
        </div>
      )
    }
  }
})

export default Login
