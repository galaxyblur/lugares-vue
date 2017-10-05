<template>
  <div>
    <header-view />
    <warning />
    <tabs-view active="Map" />
    <map-display />
    <about />
    <footer-view />
  </div>
</template>

<script>
import UIkit from 'uikit';

import 'uikit/dist/css/uikit.min.css';

import Icons from 'uikit/dist/js/uikit-icons';

import HeaderView from '../components/HeaderView';

import TabsView from '../components/TabsView';

import About from '../components/About';

import MapDisplay from '../components/MapDisplay';

import Warning from '../components/Warning';

import Footer from '../components/Footer';

UIkit.use(Icons);

export default {
  name: 'map-view',
  components: {
    'header-view': HeaderView,
    'tabs-view': TabsView,
    about: About,
    warning: Warning,
    'footer-view': Footer,
    'map-display': MapDisplay,
  },
};
</script>

<style>
</style>
