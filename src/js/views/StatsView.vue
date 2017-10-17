<template>
  <div>
    <header-view />
    <warning />
    <tabs-view active="Stats" />
    <div class="uk-container uk-container-expand uk-margin">
      <div uk-grid class="uk-child-width-1-1@s uk-child-width-1-2@m">
        <dl class="uk-description-list uk-margin">
          <dt v-if="stats.lastUSRun.name">Last run city in US-only search</dt>
          <dd v-if="stats.lastUSRun.name">
            <span>{{ stats.lastUSRun.name }} (rank #{{ stats.lastUSRun.index }})</span>
          </dd>
          <dt v-if="stats.lastWorldRun.name">Last run city in world search</dt>
          <dd v-if="stats.lastWorldRun.name">
            <span>{{ stats.lastWorldRun.name }} (rank #{{ stats.lastWorldRun.index }})</span>
          </dd>
        </dl>
        <div class="uk-text-right">
          Searched for top 20 results in <span class="uk-badge">{{ stats.cities.length }}</span> cities
        </div>
      </div>
      <el-table
        v-if="stats.cities"
        v-loading="!statsFileLoaded"
        :data="stats.cities"
        border
        :default-sort = "{prop: 'date', order: 'descending'}"
        stripe
        style="width: 100%">
        <el-table-column
          sortable
          prop="date"
          label="Date"
          min-width="130">
          <template scope="scope">
            <timeago :since="scope.row.date" :auto-update="60" :title="scope.row.dateLocale"></timeago>
          </template>
        </el-table-column>
        <el-table-column
          sortable
          prop="name"
          label="Name"
          min-width="150">
          <template scope="scope">
            <a :href="'https://www.google.com/search?q=' + scope.row.name" target="_blank">{{ formatName(scope.row.name) }}</a>
          </template>
        </el-table-column>
        <el-table-column
          sortable
          prop="resultsCount"
          label="Groups"
          min-width="120"
          show-summary>
        </el-table-column>
        <el-table-column
          sortable
          prop="population"
          :formatter="formatPopulation"
          width="120"
          label="Pop.">
        </el-table-column>
        <el-table-column
          sortable
          prop="peoplePerResult"
          :formatter="formatPerCapita"
          min-width="140"
          label="Per Capita">
        </el-table-column>
      </el-table>
    </div>
    <about />
    <footer-view />
  </div>
</template>

<script>
import Vue from 'vue';

import 'uikit/dist/css/uikit.min.css';

import _ from 'lodash';

import axios from 'axios';

import VueTimeago from 'vue-timeago';

import VueTimeagoEnUS from 'vue-timeago/locales/en-US.json';

import HeaderView from '../components/HeaderView';

import TabsView from '../components/TabsView';

import About from '../components/About';

import Warning from '../components/Warning';

import Footer from '../components/Footer';

Vue.use(VueTimeago, {
  name: 'timeago', // component name, `timeago` by default
  locale: 'en-US',
  locales: {
    // you will need json-loader in webpack 1
    'en-US': VueTimeagoEnUS,
  },
});

export default {
  name: 'stats-view',
  components: {
    'header-view': HeaderView,
    'tabs-view': TabsView,
    about: About,
    warning: Warning,
    'footer-view': Footer,
  },
  data() {
    return {
      stats: {
        cities: [],
        lastUSRun: {},
        lastWorldRun: {},
      },
      statsFileLoaded: false,
    };
  },
  methods: {
    formatName(name) {
      const lastHyphen = name.lastIndexOf('-');
      let formattedName = name;

      if (lastHyphen === name.length - 3) {
        formattedName = `${name.substr(0, lastHyphen)}, ${name.substr(lastHyphen + 1).toUpperCase()}`;
      }

      return formattedName;
    },
    formatPopulation(row) {
      const pop = new Intl.NumberFormat().format(row.population);

      return pop;
    },
    formatPerCapita(row) {
      const perCap = new Intl.NumberFormat().format(row.peoplePerResult);

      return row.peoplePerResult > 0 ? perCap : '-';
    },
  },
  created() {
    axios.get('json/stats.json')
      .then((response) => {
        const cities = [];

        _.forEach(response.data.cities, (c, i) => {
          const d = new Date(0);
          d.setUTCSeconds(c.lastRunDate);

          cities.push(_.extend({
            name: i,
            date: d.toISOString(),
            dateLocale: d.toLocaleString(),
          }, c));
        });

        response.data.cities = cities;
        this.stats = response.data;
        this.statsFileLoaded = true;
      });
  },
};
</script>

<style>
.el-table .cell {
  word-break: normal;
}
</style>
