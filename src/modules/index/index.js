import Vue from 'vue';
import App from './App';
import router from './router/router';
import ElementUI from 'element-ui';

import 'element-ui/lib/theme-chalk/index.css';
import '@/assets/css/reset.less';
import '@/assets/css/base.less';

Vue.use(ElementUI, { size: 'mini' });

const app = new Vue({
  el: '#app',
  router,
  render: h => h(App)
})