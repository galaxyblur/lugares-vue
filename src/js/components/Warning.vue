<template>
  <div class="uk-container uk-margin">
    <el-alert
      type="info"
      title="Unverified Results"
      description="Put simply, these listings come from a computer program that searches Google for the keyword 'capoeira' near a given city and collects the results. They are *not* verified to be capoeira schools or groups."
      close-text="I understand!"
      show-icon />
  </div>
</template>

<script>
import Vue from 'vue';

import ElementUI from 'element-ui';

import locale from 'element-ui/lib/locale/lang/en';

import 'element-ui/lib/theme-default/index.css';

import 'uikit/dist/css/uikit.min.css';

Vue.use(ElementUI, { locale });

export default {
  name: 'warning',
};
</script>

<style>
</style>
