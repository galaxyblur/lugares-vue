<template>
  <div class="uk-container uk-container-expand uk-margin">
    <div uk-grid class="uk-child-width-1-1@s uk-child-width-1-2@m uk-margin">
      <div>
        <el-input
          placeholder='Filter results (try "New York" or "Luanda")'
          icon="search"
          @change="handleSearchChange"
          v-model="searchTextInput">
        </el-input>
      </div>
      <div>
        <div class="uk-align-right@m">
          <el-pagination
             small
            @current-change="handleCurrentPageChange"
            layout="total, prev, pager, next"
            :page-size="perPage"
            :current-page.sync="currentPage"
            :total="groupsInCurrentSearch.length">
          </el-pagination>
        </div>
      </div>
    </div>
    <el-table :data="groupsInCurrentPage" v-loading="!groupsFileLoaded" stripe>
      <el-table-column type="expand">
        <template scope="scope">
          <div uk-grid class="uk-child-width-1-4@m uk-child-width-1-1@s">
            <div v-if="scope.row.schedule_text" class="uk-padding-small">
              <div><span class="uk-text-muted">Schedule</span></div>
              <pre class="group-schedule">{{ scope.row.schedule_text }}</pre>
            </div>
            <div v-else>No schedule found.</div>
            <div v-if="typeof scope.row.location_coords.lat === 'number' && typeof scope.row.location_coords.lng === 'number'" class="uk-padding-small">
              <div><span class="uk-text-muted">Map</span></div>
              <div>
                <a :href="'http://maps.google.com/?q=place_id:' + scope.row.id"
                  target="_blank"
                  title="Open Google Maps listing"
                  uk-tooltip>
                  <img :src="'https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyCs8hRBrRIsSo9El30ywpJWlkDDO0yap9w&size=200x200&zoom=11&markers=' + scope.row.location_text">
                </a>
              </div>
            </div>
            <div v-else>Not enough information to display map.</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Name" min-width="150">
        <template scope="scope">
          <div class="uk-margin">
            <b v-if="scope.row.isLikelyCapoeira"><i>{{ scope.row.names.join(', ') }}</i></b>
            <span v-else class="uk-text-muted">{{ scope.row.names.join(', ') }}</span>
          </div>
          <div v-if="scope.row.isLikelyCapoeira && getWebsiteDetail(scope.row, 'logo')" class="uk-margin">
            <img :src="getWebsiteDetail(scope.row, 'logo')">
          </div>
          <div class="uk-margin">
            <el-tag v-if="scope.row.possibleGroupFamily">{{ scope.row.possibleGroupFamily }}</el-tag>
            <el-tag v-if="scope.row.permanently_closed" type="danger">Closed?</el-tag>
            <el-tag v-if="scope.row.location_locality" type="gray">{{ scope.row.location_locality }}</el-tag>
            <el-tag v-if="scope.row.location_administrative_area_level_1" type="gray">{{ scope.row.location_administrative_area_level_1 }}</el-tag>
            <el-tag v-if="scope.row.location_country" type="gray">{{ scope.row.location_country }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Location" prop="location_text" min-width="200" />
      <el-table-column label="Website" min-width="200">
        <template scope="scope">
          <ul class="uk-list uk-text-small">
            <li v-if="getWebsiteDetail(scope.row, 'title')"><b><i>{{ getWebsiteDetail(scope.row, 'title') }}</i></b></li>
            <li v-if="getWebsiteDetail(scope.row, 'description')"><q>{{ getWebsiteDetail(scope.row, 'description') }}</q></li>
            <li v-if="scope.row.website"><a :href="scope.row.website" target="_blank">{{ scope.row.website }}</a></li>
            <li v-if="getWebsiteDetail(scope.row, 'status') === 200" class="uk-text-success">Website OK</li>
            <li v-if="scope.row.website && scope.row.website.indexOf('https') === 0">Secure (https)</li>
          </ul>
        </template>
      </el-table-column>
      <el-table-column label="Listings" width="100">
        <template scope="scope">
          <a :href="'http://maps.google.com/?q=place_id:' + scope.row.id"
            class="uk-button uk-button-default uk-button-small"
            target="_blank"
            title="Open Google Maps listing"
            uk-tooltip
            uk-icon="icon:google">
          </a>
        </template>
      </el-table-column>
      <el-table-column prop="score" label="Score" />
    </el-table>
  </div>
</template>

<script>
import Vue from 'vue';

import _ from 'lodash';

import axios from 'axios';

import VueFuse from 'vue-fuse';

import ElementUI from 'element-ui';

import locale from 'element-ui/lib/locale/lang/en';

import 'element-ui/lib/theme-default/index.css';

import UIkit from 'uikit';

import 'uikit/dist/css/uikit.min.css';

import Icons from 'uikit/dist/js/uikit-icons';

import GroupFamilies from '../../json/groupFamilies.json';

Vue.use(VueFuse);
Vue.use(ElementUI, { locale });
UIkit.use(Icons);

const searchOptions = {
  caseSensitive: false,
  distance: 1000,
  findAllMatches: true,
  keys: [
    'names',
    'location_text',
    'website_details.title',
    'website_details.description',
  ],
  matchAllTokens: true,
  threshold: 0.3,
  tokenize: true,
};

const groupFamilySearchOptions = Object.assign({}, searchOptions, {
  tokenize: true,
  threshold: 0,
  distance: 0,
  location: 0,
  matchAllTokens: true,
});

export default {
  name: 'data-table',
  computed: {
    groupsInCurrentPage() {
      const begin = this.currentOffset;
      const end = this.currentOffset + this.perPage;
      const groupsInCurrentPage = this.groupsInCurrentSearch.slice(begin, end);

      groupsInCurrentPage.forEach((g) => {
        const hasIsLikelyCapoeira = Object.prototype.hasOwnProperty.call(g, 'isLikelyCapoeira');
        let hasPossibleGroupFamily = Object.prototype.hasOwnProperty.call(g, 'possibleGroupFamily');

        if (hasIsLikelyCapoeira === false) {
          this.$search('capoeira', [g], searchOptions).then((results) => {
            g.isLikelyCapoeira = results.length > 0; // eslint-disable-line no-param-reassign
          });
        }

        if (hasPossibleGroupFamily === false) {
          _.forEach(GroupFamilies, (tag, searchTerm) => {
            this.$search(searchTerm, [g], groupFamilySearchOptions).then((results) => {
              // Check the property again to stop if a match has already been found
              hasPossibleGroupFamily = Object.prototype.hasOwnProperty.call(g, 'possibleGroupFamily');

              if (results.length > 0 && hasPossibleGroupFamily === false) {
                g.possibleGroupFamily = tag; // eslint-disable-line no-param-reassign
              }
            });
          });
        }
      });

      return groupsInCurrentPage;
    },
    groupsInCurrentSearch() {
      let groups;

      if (this.searchResults.length > 0) {
        groups = this.searchResults;
      } else {
        groups = _.clone(this.groups);
      }

      return groups;
    },
  },
  data() {
    return {
      currentOffset: 0,
      currentPage: 1,
      groups: [],
      groupsFileLoaded: false,
      perPage: 20,
      searchResults: [],
      searchTextInput: '',
    };
  },
  created() {
    axios.get('json/groups.json')
      .then((response) => {
        this.groupsFileLoaded = true;
        this.groups = response.data;
      });
  },
  methods: {
    handleCurrentPageChange(currentPage) {
      const newOffset = (currentPage - 1) * this.perPage;

      if (newOffset !== this.currentOffset) {
        this.$recordEvent('search-pagination', currentPage);
        this.currentOffset = newOffset;
      }
    },
    recordSearchEvent: _.debounce(function recordSearchEvent(searchTerm) {
      this.$recordEvent('search-for-term', searchTerm);
    }, 1500),
    handleSearchChange(searchTerm) {
      this.recordSearchEvent(searchTerm);
      this.$search(searchTerm, this.groups, searchOptions).then((results) => {
        this.searchResults = searchTerm ? results : [];
        this.handleCurrentPageChange(1);
      });
    },
    getWebsiteDetail(item, prop) {
      const hasWebsiteDetails = Object.prototype.hasOwnProperty.call(item, 'website_details');
      const hasProp = hasWebsiteDetails ? Object.prototype.hasOwnProperty.call(item.website_details, prop) : false;
      let val;

      if (hasProp) {
        val = item.website_details[prop];
      }

      return val;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.el-table .cell {
  word-break: normal;
}

.group-schedule {
  margin: 0;
}
</style>
