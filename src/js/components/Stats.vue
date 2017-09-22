<template>
  <div id="stats" uk-modal>
    <div class="uk-modal-dialog">
      <button class="uk-modal-close-default" type="button" uk-close></button>
      <div class="uk-modal-header">
        <h2 class="uk-modal-title">Stats</h2>
      </div>
      <div class="uk-modal-body">
        <dl class="uk-description-list">
          <dt>Last run city in US-only search</dt>
          <dd>
            <span v-if="stats.lastUSRun.name">{{ stats.lastUSRun.name }}:{{ stats.lastUSRun.index }}</span>
            <span v-else>n/a</span>
          </dd>
          <dt>Last run city in world search</dt>
          <dd>
            <span v-if="stats.lastWorldRun.name">{{ stats.lastWorldRun.name }}:{{ stats.lastWorldRun.index }}</span>
            <span v-else>n/a</span>
          </dd>
        </dl>
        <el-table
          v-if="stats.cities"
          :data="stats.cities"
          border
          style="width: 100%"
          height="250">
          <el-table-column
            label="Date"
            width="100">
            <template scope="scope">
              <timeago :since="scope.row.date" :auto-update="60"></timeago>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            label="Name"
            width="120">
          </el-table-column>
          <el-table-column
            prop="resultsCount"
            label="Total Groups In Area"
            show-summary
            width="120">
          </el-table-column>
          <el-table-column
            prop="peoplePerResult"
            label="Per Capita"
            width="120">
          </el-table-column>
          <el-table-column
            prop="population"
            label="Population"
            width="120">
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
            const d = new Date();
            d.setSeconds(c.lastRunDate);

            cities.push(_.extend({
              name: i,
              date: d.toISOString(),
            }, c));
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
