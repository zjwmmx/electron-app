import { createRouter, createWebHashHistory } from 'vue-router'

import BaseLayout from '../layout/base-layout'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '',
      component: BaseLayout,
      redirect: '/home',
      children: [
        {
          path: '/home',
          name: '首页',
          component: () => import('@renderer/pages/home')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  //   const meta = to.meta
  //   const title = _.get(meta, 'title')
  next()
})
