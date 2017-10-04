<template>
  <div>
    <header>
      <nav class="uk-navbar-container" uk-navbar>
        <div class="uk-navbar-center">
          <div class="uk-navbar-center-left">
            <ul class="uk-navbar-nav">
              <li class="uk-navbar-item">
                <a class="uk-button uk-button-text" href="#about" uk-icon="icon: question" title="About" uk-tooltip uk-toggle></a>
              </li>
            </ul>
          </div>
          <a href="/" class="uk-navbar-item uk-logo uk-text-center uk-display-block">
            <div class="uk-text-large">Lugares</div>
            <div class="uk-text-small uk-text-muted">find capoeira</div>
          </a>
          <div class="uk-navbar-center-right">
            <ul class="uk-navbar-nav">
              <li class="uk-navbar-item">
                <a class="uk-button uk-button-text" href="#stats" uk-icon="icon: info" title="Stats" uk-tooltip uk-toggle></a>
              </li>
              <li class="uk-navbar-item">
                <a class="uk-button uk-button-text" href="#map" uk-icon="icon: world" title="Map" uk-tooltip v-on:click.stop.prevent="showMap"></a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
    <warning></warning>
    <data-table></data-table>
    <about></about>
    <stats></stats>
    <div id="map-display-container"></div>
    <footer class="uk-text-center uk-text-small">
      Copyright 2017 Capoeira Online, LLC
    </footer>
  </div>
</template>

<script>
import Vue from 'vue';

import UIkit from 'uikit';

import 'uikit/dist/css/uikit.min.css';

import Icons from 'uikit/dist/js/uikit-icons';

import DataTable from '../components/DataTable';

import About from '../components/About';

import Stats from '../components/Stats';

import MapDisplay from '../components/Map';

import Warning from '../components/Warning';

UIkit.use(Icons);

export default {
  name: 'home',
  data() {
    return {
    };
  },
  components: {
    'data-table': DataTable,
    about: About,
    stats: Stats,
    // 'map-display': MapDisplay,
    warning: Warning,
  },
  methods: {
    showMap() {
      let $el = document.getElementById('map');

      if ($el === null) {
        const MapContent = Vue.extend({
          template: '<map-display></map-display>',
          components: {
            'map-display': MapDisplay,
          },
        });

        const map = new MapContent();

        map.$mount('#map-display-container');
        $el = map.$el;
      }

      UIkit.modal($el).show();
    },
  },
};
</script>

<style>
</style>
