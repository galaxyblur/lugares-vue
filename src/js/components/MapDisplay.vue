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

// import HexgridHeatmap from 'hexgrid-heatmap';

import 'uikit/dist/css/uikit.min.css';

const getGeoJSONFromGroups = (groups) => {
  const geoGroups = [];

  groups.forEach((g) => {
    geoGroups.push({
      name: g.names[0],
      lat: g.location_coords.lat,
      lng: g.location_coords.lng,
      description: g.location_text,
    });
  });

  return GeoJSON.parse(geoGroups, {
    Point: ['lat', 'lng'],
  });
};

/*
const createHeatmap = (map, data) => {
  const heatmap = new HexgridHeatmap(map, 'hexgrid-heatmap', 'waterway-label');
  heatmap.setData(data);
  heatmap.setIntensity(10000);
  heatmap.setSpread(7);
  heatmap.update();
};
*/

const createMapPoints = (map, data) => {
  map.addLayer({
    id: 'group-points',
    type: 'circle',
    source: {
      type: 'geojson',
      data,
    },
    paint: {
      'circle-color': 'rgba(200,200,0,0.25)',
      'circle-radius': 3,
    },
  }, 'waterway-label');
};

export default {
  name: 'map-display',
  data() {
    return {
      accessToken: 'pk.eyJ1IjoiZ2FsYXh5Ymx1ciIsImEiOiJjajhjMGN0ajQwNDkwMndzZnJ5Z215cmRyIn0.khRbFE6oQhHyZ_KrS_aHlA',
      mapOptions: {
        container: 'lugares-heatmap',
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
        // createHeatmap(map, geoJSONGroups);
        createMapPoints(map, geoJSONGroups);

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
