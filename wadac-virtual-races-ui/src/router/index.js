import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Admin from '../views/Admin.vue'
import ResultsPage from '../views/ResultsPage.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'WADAC Virtual Racing'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    //component: function () {
    //  return import(/* webpackChunkName: "about" */ '../views/Admin.vue')
    //}
    component: Admin
  },
  {
    path: '/results',
    name: 'ResultsPage',
    component: ResultsPage
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
