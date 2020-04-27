import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import { LMap, LTileLayer, LMarker, LPolyline } from 'vue2-leaflet';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'leaflet/dist/leaflet.css';

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);
Vue.component('l-polyline', LMarker);

Vue.config.productionTip = false

var VueCookie = require('vue-cookie');

// Tell Vue to use the plugin
Vue.use(VueCookie);
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
Vue.prototype.$http = axios

new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
