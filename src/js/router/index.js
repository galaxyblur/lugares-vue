import Vue from 'vue';
import Router from 'vue-router';
import Home from '../views/Home';
import MapView from '../views/MapView';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/map',
      name: 'Map',
      component: MapView,
    },
  ],
});
