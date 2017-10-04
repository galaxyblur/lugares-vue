<template>
  <div id="map" uk-modal>
    <div class="uk-modal-dialog">
      <button class="uk-modal-close-default" type="button" uk-close></button>
      <div class="uk-modal-header">
        <h2 class="uk-modal-title">Map</h2>
      </div>
      <div class="uk-modal-body">
        <mapbox
          @map-load="mapLoaded"
          :access-token="accessToken"
          :map-options="mapOptions">
        </mapbox>
      </div>
    </div>
  </div>
</template>

<script>
import Mapbox from 'mapbox-gl-vue';

import GeoJSON from 'geojson';

import axios from 'axios';

import HexgridHeatmap from 'hexgrid-heatmap';

import 'uikit/dist/css/uikit.min.css';

export default {
  name: 'map',
  data() {
    return {
      accessToken: 'pk.eyJ1IjoiZ2FsYXh5Ymx1ciIsImEiOiJjajhjMGN0ajQwNDkwMndzZnJ5Z215cmRyIn0.khRbFE6oQhHyZ_KrS_aHlA',
      mapOptions: {
        container: 'lugares-heatmap',
        style: 'mapbox://styles/mapbox/dark-v9',
        zoom: 8,
        center: [-122.42534069839593, 37.77444125366313],
      },
      groups: [],
    };
  },
  components: {
    mapbox: Mapbox,
  },
  methods: {
    mapLoaded(map) {
      axios.get('json/groups.json').then((response) => {
        const geoGroups = [];
        this.groups = response.data;

        this.groups.forEach((g) => {
          geoGroups.push({
            name: g.names[0],
            lat: g.location_coords.lat,
            lng: g.location_coords.lng,
          });
        });

        const geoJSONGroups = GeoJSON.parse(geoGroups, {
          Point: ['lat', 'lng'],
        });

        const heatmap = new HexgridHeatmap(map, 'hexgrid-heatmap', 'waterway-label');
        heatmap.setData(geoJSONGroups);
        heatmap.setIntensity(900);
        heatmap.setSpread(20);
        heatmap.update();

        // Each point range gets a different fill color.
        const layers = [
          [0, 'rgba(0,200,0,1)'],
          [10, 'rgba(250,250,50,1)'],
          [20, 'rgba(200,0,0,1)'],
        ];

        map.addSource('groups', {
          type: 'geojson',
          data: geoJSONGroups,
          cluster: true,
          clusterMaxZoom: 15, // Max zoom to cluster points on
          clusterRadius: 5, // Use small cluster radius for the heatmap look
        });

        layers.forEach((layer, i) => {
          map.addLayer({
            id: `cluster-${i}`,
            type: 'circle',
            source: 'groups',
            paint: {
              'circle-color': layer[1],
              'circle-radius': 3,
              'circle-blur': 0, // blur the circles to get a heatmap look
            },
            filter: i === layers.length - 1 ?
              ['>=', 'point_count', layer[0]] :
              ['all',
                ['>=', 'point_count', layer[0]],
                ['<', 'point_count', layers[i + 1][0]],
              ],
          }, 'waterway-label');
        });

        map.addLayer({
          id: 'unclustered-points',
          type: 'circle',
          source: 'groups',
          paint: {
            'circle-color': 'rgba(0,200,0,1)',
            'circle-radius': 3,
            'circle-blur': 0,
          },
          filter: ['!=', 'cluster', true],
        }, 'waterway-label');
      });
    },
  },
};
</script>

<style>
#lugares-heatmap {
  width: 100%;
  height: 500px;
}
</style>
