<template>
  <header>
    <nav class="uk-navbar-container uk-container-expand uk-padding-remove-left" uk-navbar>
      <div class="uk-navbar-left">
        <a href="/" class="uk-navbar-item uk-logo" title="Lugares">
          Lugares <div class="uk-text-small uk-margin-left">find capoeira.</div>
        </a>
      </div>
      <div class="uk-navbar-right">
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
