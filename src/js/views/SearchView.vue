<template>
  <div>
    <header-view />
    <warning />
    <tabs-view active="Search" />
    <data-table />
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

import DataTable from '../components/DataTable';

import About from '../components/About';

import Warning from '../components/Warning';

import Footer from '../components/Footer';

UIkit.use(Icons);

export default {
  name: 'search',
  components: {
    'header-view': HeaderView,
    'tabs-view': TabsView,
    'data-table': DataTable,
    about: About,
    warning: Warning,
    'footer-view': Footer,
  },
};
</script>

<style>
</style>
