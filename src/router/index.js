import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/cases',
    name: 'CaseList',
    component: () => import('@/views/CaseList.vue')
  },
  {
    path: '/case/:id',
    name: 'CaseDetail',
    component: () => import('@/views/CaseDetail.vue'),
    props: true
  },
  {
    path: '/case/:id/play',
    name: 'CasePlay',
    component: () => import('@/views/CasePlay.vue'),
    props: true
  },
  {
    path: '/progress',
    name: 'Progress',
    component: () => import('@/views/Progress.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router