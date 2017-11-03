// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import VueKeen, { recordPageview } from './plugins/VueKeen';

Vue.config.productionTip = false;
Vue.use(VueKeen);

router.afterEach((to, from) => {
  recordPageview(to.name, from.name);
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {
    App,
  },
});
