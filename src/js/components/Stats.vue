<template>
  <div id="stats" uk-modal>
    <div class="uk-modal-dialog">
      <button class="uk-modal-close-default" type="button" uk-close></button>
      <div class="uk-modal-header">
        <h2 class="uk-modal-title">Stats</h2>
      </div>
      <div class="uk-modal-body">
        <dl class="uk-description-list">
          <dt v-if="stats.lastUSRun.name">Last run city in US-only search</dt>
          <dd v-if="stats.lastUSRun.name">
            <span>{{ stats.lastUSRun.name }} (rank #{{ stats.lastUSRun.index }})</span>
          </dd>
          <dt v-if="stats.lastWorldRun.name">Last run city in world search</dt>
          <dd v-if="stats.lastWorldRun.name">
            <span>{{ stats.lastWorldRun.name }} (rank #{{ stats.lastWorldRun.index }})</span>
          </dd>
        </dl>
        <el-table
          v-if="stats.cities"
          :data="stats.cities"
          border
          :default-sort = "{prop: 'date', order: 'descending'}"
          style="width: 100%"
          height="300">
          <el-table-column
            sortable
            prop="date"
            label="Date"
            width="100">
            <template scope="scope">
              <timeago :since="scope.row.date" :auto-update="60" :title="scope.row.dateLocale"></timeago>
            </template>
          </el-table-column>
          <el-table-column
            sortable
            prop="name"
            label="Name"
            width="120">
            <template scope="scope">
              <a :href="'https://www.google.com/search?q=' + scope.row.name" target="_blank">{{ scope.row.name }}</a>
            </template>
          </el-table-column>
          <el-table-column
            sortable
            prop="resultsCount"
            label="Groups"
            show-summary
            width="120">
          </el-table-column>
          <el-table-column
            label="Population / Per Capita"
            width="200">
            <template scope="scope">
              {{ scope.row.population }} / {{ scope.row.peoplePerResult }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

import 'uikit/dist/css/uikit.min.css';

import _ from 'lodash';

import $ from 'jquery';

import axios from 'axios';

import VueTimeago from 'vue-timeago';

import VueTimeagoEnUS from 'vue-timeago/locales/en-US.json';

Vue.use(VueTimeago, {
  name: 'timeago', // component name, `timeago` by default
  locale: 'en-US',
  locales: {
    // you will need json-loader in webpack 1
    'en-US': VueTimeagoEnUS,
  },
});

export default {
  name: 'stats',
  data() {
    return {
      stats: {
        cities: undefined,
        lastUSRun: {},
        lastWorldRun: {},
      },
    };
  },
  methods: {
    fetchData() {
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
            }, c, {
              population: new Intl.NumberFormat().format(c.population),
              peoplePerResult: new Intl.NumberFormat().format(c.peoplePerResult),
            }));
          });

          response.data.cities = cities;
          this.stats = response.data;
        });
    },
  },
  mounted() {
    $(this.$el).on('shown', () => {
      this.fetchData();
    });
  },
};
</script>

<style>
</style>
