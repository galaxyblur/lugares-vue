<template>
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
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import UIkit from 'uikit';

import 'uikit/dist/css/uikit.min.css';

import Icons from 'uikit/dist/js/uikit-icons';

UIkit.use(Icons);

export default {
  name: 'header-view',
  data() {
    return {};
  },
  components: {
  },
  methods: {
  },
};
</script>

<style>
</style>
