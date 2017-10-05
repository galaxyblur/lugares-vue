import Vue from 'vue';
import Router from 'vue-router';
import SearchView from '../views/SearchView';
import MapView from '../views/MapView';
import StatsView from '../views/StatsView';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Search',
      component: SearchView,
    },
    {
      path: '/map',
      name: 'Map',
      component: MapView,
    },
    {
      path: '/stats',
      name: 'Stats',
      component: StatsView,
    },
  ],
});
