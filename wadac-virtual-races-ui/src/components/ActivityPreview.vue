<template>
  <div class="activity">
    <h4>{{activity.name}}</h4>
    <ul class="list-stats">
      <li class="stat">
        <div class="stat-subtext">Distance</div>
        <div class="stat-text">{{distance_miles}} mi</div>
      </li>
      <li class="stat">
        <div class="stat-subtext">Elevation Gain</div>
        <div class="stat-text">{{elevation_gain}} ft</div>
      </li>
      <li class="stat">
        <div class="stat-subtext">Time</div>
        <div class="stat-text">{{time_str}}</div>
      </li>
    </ul>
    <l-map ref="map" :zoom="zoom" :center="center" :options="mapOptions" style="height: 150px">
      <l-tile-layer
        :url="strava_map_url"
        :attribution="attribution"
      />
    </l-map>
  </div>
</template>

<script>
import L from 'leaflet';
import '../assets/Polyline.encoded.js'
import { latLng } from "leaflet";

export default {
  name: 'ActivityPreview',
  props: ['cookie', 'server_url', 'activity'],
  data () {
    return {
      zoom: 13,
      center: latLng(47.41322, -1.219482),
      mapOptions: {
        zoomSnap: 0.5
      },
      attribution:'',
      map: null,
      strava_map_url: 'https://b.tiles.mapbox.com/v4/strava.blprdx6r/{z}/{x}/{y}@2x.png?access_token=pk.eyJ1Ijoic3RyYXZhIiwiYSI6IlpoeXU2U0UifQ.c7yhlZevNRFCqHYm6G6Cyg',
      distance_miles: 0,
      elevation_gain: 0,
      time_str: ''

    }
  },
  mounted() {
    this.initialise()
  },
  methods: {
    initialise() {
      this.map = this.$refs.map.mapObject
      let coordinates = L.Polyline.fromEncoded(this.activity.map.summary_polyline).getLatLngs();
      L.polyline(coordinates, {
        color: 'rgb(255,0,14)',
        weight: 2,
        lineJoin: 'round'
      }).addTo(this.map)
      this.map.fitBounds(coordinates)

      // Setup data
      this.distance_miles = (this.activity.distance / 1609).toFixed(2)
      this.elevation_gain = parseInt(this.activity.total_elevation_gain * 3.281)
      let seconds = this.activity.moving_time
      if (seconds > 3600) {
        let hours = Math.floor(seconds / 3600) +' hr'
        let minutes = parseInt((seconds % 3600) / 60) + ' min'
        this.time_str = hours + ' ' + minutes
      } else {
        this.time_str = parseInt(seconds / 60) +' min'
      }
    }
    
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .activity {
    width: 100%;
    margin: 0 auto;
    margin-left: 20px;
  }

  ul.list-stats {
    display: flex;
    flex-direction: row;
    list-style: none;
    align-items: stretch;
    flex-wrap: wrap;
    padding-inline-start: 0px;
  }

  ul.list-stats li {
    margin-left: 0;
    margin-right: 16px;
    padding-right: 16px;
    position: relative;
  }

  ul.list-stats li:after {
    content: '';
    display: block;
    border-right: 1px solid #f0f0f5;
    height: 24px;
    width: 1px;
    position: absolute;
    right: 0;
    top: 50%;
    margin-top: -12px;
  }

  ul.list-stats li:last-child:after {
    content: none
  }

  .stat-subtext {
    font-size: 12px;
    font-weight: 400;
    color: #494950;
    line-height: 1.2;
  }

  .stat-text {
    font-weight: 400;
    line-height: 1;
    white-space: nowrap;
    -webkit-font-smoothing: antialiased;
  }

</style>
