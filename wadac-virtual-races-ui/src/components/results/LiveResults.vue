<template>
  <div class="results">
    <h1 @click="$router.push('/')" class="hover-cursor">WADAC Virtual Racing</h1>
    <p class="submit-link" @click="$router.push('/')">Submit Result</p>
    <h3 class="results-head">Provisional Results</h3>
    <div class="event-select-container" v-if="!loading">
      <div class="row">
        <label for="event" class="col-sm-3 col-form-label">Event</label>
        <div class="col-sm-9">
          <b-form-select v-model="selected_event" :options="events" required></b-form-select>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
    <div v-if="!wcr && preview_results_set.length > 0">
      <div class="event-stats" v-if="!duathlon">
        <p><span class="stat-label">Event Distance:</span> <span class="ref-distance">{{ref_distance}}</span> mi</p>
        <p><span class="stat-label">Event Elevation Gain:</span> <span class="ref-distance">{{ref_elevation_gain}}</span> ft</p>
      </div>
      <div class="event-stats" v-if="!duathlon">
        <p class="net-chng" v-if="ref_elevation_change"><span class="stat-label">Event Net Elevation Change:</span> <span class="ref-distance">{{ref_elevation_change}}</span> ft</p>
      </div>
      <b-table striped hover sticky-header 
        :fields="fields"
        :items="preview_results_set"
        :sort-by="'adjusted_time'"
        class="live-results-table">

        <template v-slot:cell(pos)="data">
          <span v-html="data.index + 1"></span>
        </template>
      </b-table>
    </div>  
    <div v-else-if="wcr">
      <WelshCastlesResults :preview_results_set="preview_results_set"></WelshCastlesResults>
    </div>
    <div v-else-if="show_results" class="italic">
      No results submitted
    </div> 
  </div>
</template>
<script>
import API from '../../services/api.js'
import ResultsModal from '../admin/ResultsModal.vue'
import WelshCastlesResults from './WelshCastlesResults.vue'

export default {
  name: 'LiveResults',
  props: [],
  components: {
    ResultsModal,
    WelshCastlesResults
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
      ref_elevation_change: false,
      wcr: false,
      duathlon: false,
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
      this.getActiveEvents().then(prev_length => {

        // Get WCR events
        API.getWCREvents().then(response => {
          if (Object.keys(response).indexOf('err') > -1) {
            console.log(response.err)
          } else {
            // get existing ids
            let existing_ids = []
            this.full_events.forEach(fe => {
              existing_ids.push(fe._id)
            })
            response.data.forEach((ev, idx) => {
              if (existing_ids.indexOf(ev._id) == -1) {
                let incrementer = idx + 1
                this.events.push({"value": (prev_length - 1)+incrementer, "text": ev.event_name})
                this.full_events.push(ev)
              }
            })
          }
        })
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
            resolve(this.full_events.length)
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
          this.duathlon = item.duathlon_event
          this.ref_distance = item.distance
          this.ref_elevation_gain = item.elevation_gain
          this.ref_elevation_change = item.elevation_change

          this.fields = [
            {"key": "pos", "sortable": false},
            {"key": "athlete_name", "sortable": false}
          ]
          if (this.duathlon) {
            this.fields.push({"key": "adjusted_time", "label": "Adjusted Time (s)", "sortable": false, "thClass": 'd-none', "tdClass": 'd-none'})
            this.fields.push({"key": "hms", "label": "Adjusted Time", "sortable": false})
            this.preview_results_set.forEach((r, idx) => {
              r.adjusted_time = r['moving_time']
              let h = parseInt(r.adjusted_time / 3600).toString()
              let m = parseInt((r.adjusted_time % 3600)/60).toString()
              let s = parseInt((r.adjusted_time % 3600)%60).toString()
              if (h.length == 1) {
                  h = '0'+h
              }
              if (m.length == 1) {
                  m = '0'+m
              }
              if (s.length == 1) {
                  s = '0'+s
              }
              let hms_str = h+':'+m+':'+s
              r.hms = hms_str
              
            })
          } else if (this.ref_distance && this.ref_elevation_gain && this.ref_elevation_change) {
            this.fields.push({"key": "adjusted_time", "label": "Adjusted Time (s)", "sortable": false, "thClass": 'd-none', "tdClass": 'd-none'})
            this.fields.push({"key": "hms", "label": "Adjusted Time", "sortable": false})

            // Adjust time to match event
            this.preview_results_set.forEach((r, idx) => {
              let followed_set_course = r['followed_set_course']
              if (!followed_set_course || followed_set_course == undefined) {
                followed_set_course = "no"
              }

              let adj_obj = API.calculateAdjustedTime(parseFloat(this.ref_distance), parseFloat(this.ref_elevation_gain),
                parseFloat(this.ref_elevation_change), parseFloat(r['distance']), parseFloat(r['moving_time']), 
                parseFloat(r['elevation_gain']), parseFloat(r['net_elevation_change']), followed_set_course)
              let adj_time = adj_obj['adj_time']
              let ref_dist = adj_obj['ref_distance']
              let ref_elev = adj_obj['ref_elevation_gain']
              let ref_elev_change = adj_obj['ref_elevation_change']
              let hms = adj_obj['hms_str']

              r.ref_distance = ref_dist
              r.ref_elevation_gain = ref_elev
              r.ref_elevation_change = ref_elev_change
              r.adjusted_time = adj_time
              r.hms = hms
              r.pos = idx + 1

            })
          } else if (this.ref_distance && this.ref_elevation_gain) {
            this.fields.push({"key": "adjusted_time", "label": "Adjusted Time (s)", "sortable": false, "thClass": 'd-none', "tdClass": 'd-none'})
            this.fields.push({"key": "hms", "label": "Adjusted Time", "sortable": false})

            // Adjust time to match event
            this.preview_results_set.forEach((r, idx) => {
              let adj_obj = API.calculateAdjustedTimeOLD(parseFloat(this.ref_distance), parseFloat(this.ref_elevation_gain), 
                parseFloat(r['distance']), parseFloat(r['moving_time']), parseFloat(r['elevation_gain']))
              let hms = adj_obj['hms_str']
              r.hms = hms
              r.adjusted_time = adj_obj['adj_time']
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

  p.net-chng {
    margin: 0 auto;
    max-width: 100%;
    margin-bottom: 20px;
  }

  .submit-link {
    color: blue;
    text-decoration: underline;
  }

  .submit-link:hover {
    cursor: pointer;
  }
  

</style>

