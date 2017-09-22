<template>
  <div>
    <header>
      <nav class="uk-navbar-container" uk-navbar>
        <div class="uk-navbar-center">
          <div class="uk-navbar-center-left">
            <ul class="uk-navbar-nav">
              <li class="uk-navbar-item">
                <a href="#about" uk-icon="icon: question" title="About" uk-tooltip uk-toggle></a>
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
                <a href="#stats" uk-icon="icon: info" title="Stats" uk-tooltip uk-toggle></a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
    <data-table></data-table>
    <about></about>
    <stats></stats>
    <footer class="uk-text-center uk-text-small">
      Copyright 2017 Capoeira Online, LLC
    </footer>
  </div>
</template>

<script>
import UIkit from 'uikit';

import 'uikit/dist/css/uikit.min.css';

import Icons from 'uikit/dist/js/uikit-icons';

import DataTable from '../components/DataTable';

import About from '../components/About';

import Stats from '../components/Stats';

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
  },
};
</script>

<style>
</style>
