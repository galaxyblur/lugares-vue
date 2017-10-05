<template>
  <div>
    <header-view></header-view>
    <warning></warning>
    <tabs-view active="Search"></tabs-view>
    <data-table></data-table>
    <about></about>
    <footer class="uk-text-center uk-text-small">
      Copyright 2017 Capoeira Online, LLC
    </footer>
  </div>
</template>

<script>
import UIkit from 'uikit';

import 'uikit/dist/css/uikit.min.css';

import Icons from 'uikit/dist/js/uikit-icons';

import HeaderView from '../components/HeaderView';

import TabsView from '../components/TabsView';

import DataTable from '../components/DataTable';

import About from '../components/About';

import Warning from '../components/Warning';

UIkit.use(Icons);

export default {
  name: 'search',
  components: {
    'header-view': HeaderView,
    'tabs-view': TabsView,
    'data-table': DataTable,
    about: About,
    warning: Warning,
  },
};
</script>

<style>
</style>
