<template>
  <div class="results">
    <h1 @click="$router.push('/')" class="hover-cursor">WADAC Virtual Racing</h1>
    <h3 class="results-head">Provisional Results</h3>
    <div class="event-select-container" v-if="!loading">
      <div class="row">
        <b-form-select v-model="selected_event" :options="events" required></b-form-select>
      </div>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
    <div v-if="preview_results_set.length > 0">
      <div class="event-stats">
        <p><span class="stat-label">Event Distance:</span> <span class="ref-distance">{{ref_distance}}</span> mi</p>
        <p><span class="stat-label">Event Elevation Gain:</span> <span class="ref-distance">{{ref_elevation_gain}}</span> ft</p>
      </div>
      <b-table striped hover sticky-header 
        :fields="fields"
        :items="preview_results_set"
        :sort-by="'adjusted_time'"
        class="live-results-table">
      </b-table>
    </div>  
    <div v-else-if="show_results" class="italic">
      No results submitted
    </div> 
  </div>
</template>
<script>
import API from '../../services/api.js'
import ResultsModal from '../admin/ResultsModal.vue'

export default {
  name: 'LiveResults',
  props: [],
  components: {
    ResultsModal
  },
  data () {
    return {
      events: [{ value: null, text: 'Please select an event', disabled: true }],
      selected_event: null,
      full_events: [],
      loading: true,
      preview_results_set: [],
      fields: [],
      ref_distance: false,
      ref_elevation_gain: false,
      wcr: false,
      show_results: false
    }
  },
  watch: {
    selected_event: function() {
      let ev = this.full_events[this.selected_event]
      this.previewResults(ev)
    }
  },
  mounted() {
    this.initialise()
  },
  methods: {
    initialise() {
      this.getActiveEvents().then(_ => {
        this.loading = false
      })
    },

    getActiveEvents() {
      return new Promise((resolve, reject) => {
        API.getActiveEvents().then(response => {
          if (Object.keys(response).indexOf('err') > -1) {
            console.log(response.err)
            reject()
          } else {
            this.full_events = response.data
            response.data.forEach((ev, idx) => {
              this.events.push({"value": idx, "text": ev.event_name})
            })
            resolve()
          }
        })
      })
    },
    previewResults(item) {
      API.eventResults(item._id).then(response => {
        if (Object.keys(response).indexOf('err') > -1) {
          console.log(response.err)
        } else {
          this.preview_results_set = response.data
          this.wcr = item.wcr_event
          this.ref_distance = item.distance
          this.ref_elevation_gain = item.elevation_gain

          this.fields = [
            {"key": "pos", "sortable": false},
            {"key": "athlete_name", "sortable": false}
          ]
          if (this.wcr) {
            this.fields.push({"key": "wcr_team", "label": "Team", "sortable": false})
            this.fields.push({"key": "wcr_stage", "label": "Stage", "sortable": false})
          } 
          if (this.ref_distance && this.ref_elevation_gain) {
            this.fields.push({"key": "hms", "label": "Adjusted Time", "sortable": false})

            // Adjust time to match event
            this.preview_results_set.forEach((r, idx) => {
              let adj_obj = API.calculateAdjustedTime(parseFloat(this.ref_distance), parseFloat(this.ref_elevation_gain), 
                parseFloat(r['distance']), parseFloat(r['moving_time']), parseFloat(r['elevation_gain']))
              let hms = adj_obj['hms_str']
              r.hms = hms
              r.pos = idx + 1
            })
          } else if (this.wcr) {
            this.fields.push({"key": "hms", "label": "Adjusted Time (hh:mm:ss)", "sortable": false})

            // Adjust time to match WCR stage
            this.preview_results_set.forEach((r, idx) => {
              let adj_obj = API.calculateAdjustedWCRTime(parseInt(r['wcr_stage']), parseFloat(r['distance']), 
                parseFloat(r['elapsed_time']), parseFloat(r['elevation_gain']))
              let hms = adj_obj['hms_str']
              r.hms = hms
              r.pos = idx + 1
            })
          }
          this.show_results = true
        }
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .results {
    margin-top: 40px;
    margin: 0 auto;
    max-width: 90%;
  }

  .event-select-container {
    max-width: 400px;
    margin: 0 auto;
    margin-top: 30px;
    margin-bottom: 30px;
  }

  h1.hover-cursor {
    cursor: pointer
  }

  .live-results-table {
    max-height: 500px;
    max-width: 500px;
    margin: 0 auto;
  }

  .live-results-table tbody {
    height: 100%;
  }

  .event-stats {
    display: flex;
    margin: 0 auto;
    max-width: 400px;
    justify-content: space-between;
    font-style: italic;
  }

  h3.results-head {
    margin-top: 10px;
  }
  

</style>

