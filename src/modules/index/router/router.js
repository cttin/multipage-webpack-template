import Vue from 'vue';
import Router from 'vue-router';

// 路由懒加载
const index = () => import(/* webpackChunkName: "index/chunks/index" */ '../pages/index.vue');
// const home = () => import(/* webpackChunkName: "index/chunks/home" */ '../pages/home/home');
// const details = () => import(/* webpackChunkName: "index/chunks/details" */ '../pages/details/details');
// import home from '../pages/home/home';
// import details from '../pages/details/details';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    // {
    //   path: '/',
    //   redirect: '/index'
    // }, {
    //   path: '/index',
    //   component: index
    // },
    {
      path: '/',
      component: index
    }, {
      path: '/home',
      component: () => import(/* webpackChunkName: "index/chunks/home" */ '../pages/home/home')
    }, {
      path: '/details',
      component: () => import(/* webpackChunkName: "index/chunks/details" */ '../pages/details/details')
    }]
});

export default router;

