import { createRouter, createWebHashHistory } from 'vue-router'

import MainLayout from '../components/base-layout'
// import _ from 'lodash'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '',
      component: MainLayout,
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
