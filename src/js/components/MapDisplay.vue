<template>
  <div class="uk-container uk-container-expand uk-margin">
    <mapbox
      @map-load="mapLoaded"
      :access-token="accessToken"
      :geolocate-control="{ show: true, position: 'top-left', options: {} }"
      :fullscreen-control="{ show: true, position: 'top-right' }"
      :map-options="mapOptions">
    </mapbox>
  </div>
</template>

<script>
import Mapbox from 'mapbox-gl-vue';

import GeoJSON from 'geojson';

import axios from 'axios';

import 'uikit/dist/css/uikit.min.css';

const getGeoJSONFromGroups = function getGeoJSONFromGroups(groups) {
  const geoGroups = [];

  groups.forEach((g) => {
    geoGroups.push({
      name: g.names[0],
      lat: g.location_coords.lat,
      lng: g.location_coords.lng,
      description: g.location_text,
      score: g.score,
    });
  });

  return GeoJSON.parse(geoGroups, {
    Point: ['lat', 'lng'],
  });
};

const createHeatmap = function createHeatmap(map) {
  map.addLayer({
    id: 'groups-heatmap',
    type: 'heatmap',
    source: 'heatmap-groups',
    maxzoom: 15,
    paint: {
      // increase weight as diameter breast height increases
      'heatmap-weight': {
        property: 'score',
        type: 'exponential',
        stops: [
          [1, 0.1],
          [25, 1],
        ],
      },
      // increase intensity as zoom level increases
      'heatmap-intensity': {
        stops: [
          [11, 1],
          [15, 3],
        ],
      },
      // assign color values be applied to points depending on their weight
      'heatmap-color': {
        stops: [
          [0, 'rgba(236,222,239,0)'],
          [0.2, 'rgb(208,209,230)'],
          [0.4, 'rgb(166,189,219)'],
          [0.6, 'rgb(103,169,207)'],
          [0.8, 'rgb(28,144,153)'],
          [1, 'rgb(1,108,89)'],
        ],
      },
      // increase radius as zoom increases
      'heatmap-radius': {
        stops: [
          [1, 3],
          [11, 15],
        ],
      },
      // decrease opacity to transition into the circle layer
      'heatmap-opacity': {
        default: 1,
        stops: [
          [14, 1],
          [15, 0],
        ],
      },
    },
  }, 'waterway-label');
};

const createMapPoints = function createMapPoints(map) {
  map.addLayer({
    id: 'group-points',
    type: 'circle',
    source: 'groups',
    minzoom: 8,
    paint: {
      'circle-radius': {
        property: 'score',
        type: 'exponential',
        stops: [
          [{ zoom: 15, value: 1 }, 5],
          [{ zoom: 22, value: 1 }, 20],
        ],
      },
      'circle-color': {
        property: 'score',
        type: 'exponential',
        stops: [
          [0, 'rgba(236,222,239,0)'],
          [10, 'rgb(236,222,239)'],
          [20, 'rgb(208,209,230)'],
          [30, 'rgb(166,189,219)'],
          [40, 'rgb(103,169,207)'],
          [50, 'rgb(28,144,153)'],
          [60, 'rgb(1,108,89)'],
        ],
      },
      'circle-stroke-color': 'white',
      'circle-stroke-width': 1,
    },
  }, 'waterway-label');
};

const initPopup = function initPopup(map) {
  const popup = new window.mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  map.on('mouseenter', 'group-points', (e) => {
    const canvas = map.getCanvas();
    canvas.style.cursor = 'pointer';

    popup.setLngLat(e.features[0].geometry.coordinates)
      .setHTML(`
        <dl class="uk-description-list uk-margin-remove-bottom uk-text-small">
          <dt>${e.features[0].properties.name}</dt>
          <dd>${e.features[0].properties.description}</dd>
        </dl>
      `)
      .addTo(map);
  });

  map.on('mouseleave', 'group-points', () => {
    const canvas = map.getCanvas();
    canvas.style.cursor = '';
    popup.remove();
  });
};

const initCenterOnClick = function initCenterOnClick(map) {
  map.on('click', 'group-points', (e) => {
    map.flyTo({ center: e.features[0].geometry.coordinates });
  });
};

export default {
  name: 'map-display',
  data() {
    return {
      accessToken: 'pk.eyJ1IjoiZ2FsYXh5Ymx1ciIsImEiOiJjajhjMGN0ajQwNDkwMndzZnJ5Z215cmRyIn0.khRbFE6oQhHyZ_KrS_aHlA',
      mapOptions: {
        container: 'cade-heatmap',
        style: 'mapbox://styles/mapbox/dark-v9',
        zoom: 2,
        center: [-38.516667, -12.983333], // lng, lat
      },
    };
  },
  components: {
    mapbox: Mapbox,
  },
  methods: {
    mapLoaded(map) {
      axios.get('json/groups.json').then((response) => {
        const geoJSONGroups = getGeoJSONFromGroups(response.data);

        map.addSource('groups', {
          type: 'geojson',
          data: geoJSONGroups,
        });

        map.addSource('heatmap-groups', {
          type: 'geojson',
          data: geoJSONGroups,
        });

        createHeatmap(map);
        createMapPoints(map);
        initPopup(map);
        initCenterOnClick(map);
      });
    },
  },
};
</script>

<style>
#cade-heatmap {
  width: 100%;
  height: 500px;
}
</style>
