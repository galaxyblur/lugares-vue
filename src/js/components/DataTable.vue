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
    <el-table :data="groupsInCurrentPage" stripe>
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
              <div><img :src="'https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyCs8hRBrRIsSo9El30ywpJWlkDDO0yap9w&size=200x200&zoom=11&markers=' + scope.row.location_text"></div>
            </div>
            <div v-else>Not enough information to display map.</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Name" min-width="150">
        <template scope="scope">
          <div class="uk-margin">
            <b v-if="isLikelyCapoeira(scope.row)"><i>{{ scope.row.names.join(', ') }}</i></b>
            <span v-else class="uk-text-muted">{{ scope.row.names.join(', ') }}</span>
          </div>
          <div v-if="isLikelyCapoeira(scope.row) && getWebsiteDetail(scope.row, 'logo')" class="uk-margin">
            <img :src="getWebsiteDetail(scope.row, 'logo')">
          </div>
          <div class="uk-margin">
            <el-tag v-if="getPossibleGroupFamily(scope.row)">{{ getPossibleGroupFamily(scope.row) }}</el-tag>
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
    </el-table>
  </div>
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

import GroupFamilies from '../../json/groupFamilies.json';

Vue.use(ElementUI, { locale });
UIkit.use(Icons);

const isLikelyCapoeiraCache = {};

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
    getSearchableValues(item) {
      const values = [
        item.names[0].toLowerCase(),
        item.location_text.toLowerCase(),
      ];

      if (item.website_details) {
        if (item.website_details.title) {
          values.push(item.website_details.title.toLowerCase());
        }

        if (item.website_details.description) {
          values.push(item.website_details.description.toLowerCase());
        }
      }

      return values;
    },
    handleCurrentPageChange(currentPage) {
      this.currentOffset = (currentPage - 1) * this.perPage;

      const begin = this.currentOffset;
      const end = this.currentOffset + this.perPage;

      this.groupsInCurrentPage = this.groupsInCurrentSearch.slice(begin, end);
    },
    handleSearchChange(searchTerm) {
      let found = false;

      this.groupsInCurrentSearch = _.filter(this.groups, (item) => {
        _.each(this.getSearchableValues(item), (v) => {
          if (v.indexOf(searchTerm.toLowerCase()) >= 0) {
            found = true;
          }
        });

        return found;
      });

      this.handleCurrentPageChange(1);
    },
    isLikelyCapoeira(item) {
      let isLikely = false;

      if (Object.prototype.hasOwnProperty.call(isLikelyCapoeiraCache, item.id)) {
        isLikely = isLikelyCapoeiraCache[item.id];
      } else {
        const values = this.getSearchableValues(item);

        _.each(values, (v) => {
          if (v.indexOf('capoeira') >= 0) {
            isLikely = true;
          }
        });

        isLikelyCapoeiraCache[item.id] = isLikely;
      }

      return isLikely;
    },
    getWebsiteDetail(item, prop) {
      let val;
      const hasWebsiteDetails = Object.prototype.hasOwnProperty.call(item, 'website_details');
      const hasProp = hasWebsiteDetails ? Object.prototype.hasOwnProperty.call(item.website_details, prop) : false;

      if (hasProp) {
        val = item.website_details[prop];
      }

      return val;
    },
    getPossibleGroupFamily(item) {
      let groupFamily;
      const values = this.getSearchableValues(item);

      _.each(GroupFamilies, (tag, searchTerm) => {
        _.each(values, (v) => {
          if (v.indexOf(searchTerm.toLowerCase()) >= 0) {
            groupFamily = tag;
          }
        });
      });

      return groupFamily;
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
