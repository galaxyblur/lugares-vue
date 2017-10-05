<template>
  <div>
    <header-view></header-view>
    <warning></warning>
    <tabs-view active="Map"></tabs-view>
    <map-display></map-display>
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

import HeaderView from '../components/HeaderView';

import TabsView from '../components/TabsView';

import About from '../components/About';

import Stats from '../components/Stats';

import MapDisplay from '../components/MapDisplay';

import Warning from '../components/Warning';

UIkit.use(Icons);

export default {
  name: 'map-view',
  components: {
    'header-view': HeaderView,
    'tabs-view': TabsView,
    about: About,
    stats: Stats,
    warning: Warning,
    'map-display': MapDisplay,
  },
};
</script>

<style>
</style>
