<template>
  <header>
    <nav class="uk-navbar-container uk-container-expand" uk-navbar>
      <div class="uk-navbar-left">
        <a href="/" class="uk-navbar-item uk-logo uk-padding-small" title="Cadê a Capoeira?">
          <img src="/logo-192x192.png" class="uk-height-1-1"> Cadê a Capoeira? <div class="uk-text-small uk-margin-left">find capoeira.</div>
        </a>
      </div>
      <div class="uk-navbar-right uk-text-right">
        <a href="https://www.capoeiraonline.net" class="uk-navbar-item" target="_blank">
          <i>a free <u>Capoeira Online</u> service</i>
        </a>
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
