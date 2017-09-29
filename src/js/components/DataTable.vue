<template>
  <section class="uk-section">
    <div class="uk-container uk-container-expand">
      <div uk-grid class="uk-child-width-1-1@s uk-child-width-1-2@m uk-child-width-1-3@l">
        <div>
          <h3>Search Results</h3>
        </div>
        <div>
          <el-input
            placeholder='Filter results (try "New York" or "Luanda")'
            icon="search"
            @change="handleSearchChange"
            v-model="searchTextInput">
          </el-input>
        </div>
        <div>
          <div class="uk-align-right@l">
            <el-pagination
              @current-change="handleCurrentPageChange"
              layout="total, prev, pager, next"
              :page-size="perPage"
              :current-page.sync="currentPage"
              :total="groupsInCurrentSearch.length">
            </el-pagination>
          </div>
        </div>
      </div>
      <el-table :data="groupsInCurrentPage" stripe>
        <el-table-column type="expand">
          <template scope="scope">
            <el-row>
              <el-col :span="6">
                <div v-if="scope.row.schedule_text" class="uk-padding-small">
                  <div><span class="uk-text-muted">Schedule</span></div>
                  <pre class="group-schedule">{{ scope.row.schedule_text }}</pre>
                </div>
                <span v-else>n/a</span>
              </el-col>
              <el-col :span="6">
                <div v-if="typeof scope.row.location_coords.lat === 'number' && typeof scope.row.location_coords.lng === 'number'" class="uk-padding-small">
                  <div><span class="uk-text-muted">Map</span></div>
                  <div><img :src="'https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyCs8hRBrRIsSo9El30ywpJWlkDDO0yap9w&size=200x200&zoom=11&markers=' + scope.row.location_text"></div>
                </div>
                <span v-else>Not enough information to display map.</span>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column prop="names" label="Name" />
          <!--
        <el-table-column label="Image">
          <template scope="scope">
            <img v-if="scope.row.image" :src="scope.row.image">
            <span v-else>n/a</span>
          </template>
        </el-table-column>
          -->
        <el-table-column label="Location">
          <template scope="scope">
            <ul class="uk-list">
              <li><b>Address:</b> {{ scope.row.location_text }}</li>
              <li v-if="scope.row.location_locality">
                <b>Tags:</b>
                <el-tag v-if="scope.row.location_locality" type="gray">{{ scope.row.location_locality }}</el-tag>
                <el-tag v-if="scope.row.location_administrative_area_level_1" type="gray">{{ scope.row.location_administrative_area_level_1 }}</el-tag>
                <el-tag v-if="scope.row.location_country" type="gray">{{ scope.row.location_country }}</el-tag>
                <el-tag v-if="scope.row.permanently_closed" type="danger">Closed?</el-tag>
              </li>
            </ul>
          </template>
        </el-table-column>
        <el-table-column label="Website">
          <template scope="scope">
            <a v-if="scope.row.website" :href="scope.row.website" target="_blank">
              <span v-if="scope.row.website.indexOf('https') === 0" uk-icon="icon:lock"></span>
              {{ scope.row.website }}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="Listings">
          <template scope="scope">
            <a v-if="scope.row.location_text"
              :href="'http://maps.google.com/?q=place_id:' + scope.row.id"
              class="uk-button uk-button-default uk-button-small"
              target="_blank"
              title="Open Google Maps listing"
              uk-tooltip
              uk-icon="icon:google">
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="Score" />
        <!--
        <el-table-column prop="style" label="Possible Style" />
        <el-table-column prop="teachers" label="Teachers" />
        -->
      </el-table>
    </div>
  </section>
</template>

<script>
import Vue from 'vue';

import _ from 'lodash';

import axios from 'axios';

import ElementUI from 'element-ui';

import locale from 'element-ui/lib/locale/lang/en';

import 'element-ui/lib/theme-default/index.css';

import UIkit from 'uikit';

import 'uikit/dist/css/uikit.min.css';

import Icons from 'uikit/dist/js/uikit-icons';

Vue.use(ElementUI, { locale });
UIkit.use(Icons);

export default {
  name: 'data-table',
  data() {
    return {
      groups: [],
      perPage: 20,
      currentPage: 1,
      currentOffset: 0,
      searchTextInput: '',
      groupsInCurrentSearch: [],
      groupsInCurrentPage: [],
    };
  },
  mounted() {
    axios.get('json/groups.json')
      .then((response) => {
        const begin = this.currentOffset;
        const end = this.currentOffset + this.perPage;

        this.groups = response.data;
        this.groupsInCurrentSearch = this.groups;
        this.groupsInCurrentPage = this.groupsInCurrentSearch.slice(begin, end);
      });
  },
  methods: {
    handleCurrentPageChange(currentPage) {
      this.currentOffset = (currentPage - 1) * this.perPage;

      const begin = this.currentOffset;
      const end = this.currentOffset + this.perPage;

      this.groupsInCurrentPage = this.groupsInCurrentSearch.slice(begin, end);
    },
    handleSearchChange(v) {
      this.groupsInCurrentSearch = _.filter(this.groups, (g) => {
        const foundInName = g.names[0].toLowerCase().indexOf(v.toLowerCase()) >= 0;
        const foundInAddress = g.location_text.toLowerCase().indexOf(v.toLowerCase()) >= 0;

        return foundInName || foundInAddress;
      });
      this.handleCurrentPageChange(1);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.el-table .cell {
  word-break: break-word;
}

.group-schedule {
  margin: 0;
}
</style>
