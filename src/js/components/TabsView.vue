<template>
  <div class="uk-container uk-container-expand uk-margin">
    <ul uk-tab>
      <li :class="active === 'Search' ? 'uk-active' : ''">
        <router-link to="/">Search</router-link>
      </li>
      <li :class="active === 'Map' ? 'uk-active' : ''">
        <router-link to="map">Map</router-link>
      </li>
      <li :class="active === 'Stats' ? 'uk-active' : ''">
        <router-link to="stats">Stats</router-link>
      </li>
      <li>
        <a href="#about" uk-toggle v-on:click.stop.prevent="handleAboutClick">About</a>
      </li>
    </ul>
  </div>
</template>

<script>
import UIkit from 'uikit';

import 'uikit/dist/css/uikit.min.css';

import Icons from 'uikit/dist/js/uikit-icons';

UIkit.use(Icons);

export default {
  name: 'tabs-view',
  props: ['active'],
};
</script>

<style>
</style>
