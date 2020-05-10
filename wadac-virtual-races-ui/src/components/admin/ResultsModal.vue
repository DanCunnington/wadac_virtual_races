<template>
  <div class="resultsPreview">
    <div v-if="preview_results_set.length > 0">
      <b-table striped hover sticky-header 
        :fields="fields"
        :items="preview_results_set"
        :sort-by="'adjusted_time'"
        class="results-table">
      </b-table>
    </div>  
    <div v-else class="italic">
      No results submitted
    </div>  
  </div>
</template>
<script>
import API from '../../services/api.js'
export default {
  name: 'ResultsModal',
  props: [ 'preview_results_set', 'wcr', 'ref_distance', 'ref_elevation_gain'],
  components: {
    
  },
  data () {
    return {
      fields: [],
    }
  },
  mounted() {
    this.initialise()
  },
  watch: {
 
  },
  methods: {
    initialise() {
      this.fields = [
        {"key": "start_date", "sortable": false},
        {"key": "athlete_name", "sortable": false}
      ]
      if (this.wcr) {
        this.fields.push({"key": "wcr_team", "label": "Team", "sortable": false})
        this.fields.push({"key": "wcr_stage", "label": "Stage", "sortable": false})
      } 
      this.fields.push({"key": "activity_name", "sortable": false})
      this.fields.push({"key": "elapsed_time", "label": "Elapsed Time (s)", "sortable": false})
      this.fields.push({"key": "moving_time", "label": "Moving Time (s)", "sortable": false})
      this.fields.push({"key": "elevation_gain", "label": "Elevation Gain (ft)", "sortable": false})
      this.fields.push({"key": "distance", "label": "Distance (mi)", "sortable": false})

      if (this.ref_distance && this.ref_elevation_gain) {
        this.fields.push({"key": "ref_distance", "label": "Event Reference Distance (mi)", "sortable": false})
        this.fields.push({"key": "ref_elevation_gain", "label": "Event Reference Elevation Gain (ft)", "sortable": false})
        this.fields.push({"key": "adjusted_time", "label": "Adjusted Time (s)", "sortable": false})
        this.fields.push({"key": "hms", "label": "Adjusted Time (h:m:s)", "sortable": false})

        // Adjust time to match event
        this.preview_results_set.forEach(r => {
          let adj_obj = API.calculateAdjustedTime(parseFloat(this.ref_distance), parseFloat(this.ref_elevation_gain), 
            parseFloat(r['distance']), parseFloat(r['moving_time']), parseFloat(r['elevation_gain']))
          let adj_time = adj_obj['adj_time']
          let ref_dist = adj_obj['ref_distance']
          let ref_elev = adj_obj['ref_elevation_gain']
          let hms = adj_obj['hms_str']

          r.ref_distance = ref_dist
          r.ref_elevation_gain = ref_elev
          r.adjusted_time = adj_time
          r.hms = hms

        })
      } else if (this.wcr) {
        this.fields.push({"key": "ref_distance", "label": "Stage Reference Distance (mi)", "sortable": false})
        this.fields.push({"key": "ref_elevation_gain", "label": "Stage Reference Elevation Gain (ft)", "sortable": false})
        this.fields.push({"key": "adjusted_time", "label": "Adjusted Time (s)", "sortable": false})
        this.fields.push({"key": "hms", "label": "Adjusted Time (h:m.s)", "sortable": false})


        // Adjust time to match WCR stage
        this.preview_results_set.forEach(r => {
          let adj_obj = API.calculateAdjustedWCRTime(parseInt(r['wcr_stage']), parseFloat(r['distance']), 
            parseFloat(r['elapsed_time']), parseFloat(r['elevation_gain']))
          let adj_time = adj_obj['adj_time']
          let ref_dist = adj_obj['ref_distance']
          let ref_elev = adj_obj['ref_elevation_gain']
          let hms = adj_obj['hms_str']

          r.ref_distance = ref_dist
          r.ref_elevation_gain = ref_elev
          r.adjusted_time = adj_time
          r.hms = hms
        })
      }
    }    
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .resultsPreview {
    
  }

  .italic {
    font-style: italic;
  }

  .results-table {
    max-height: none !important;
  }
</style>

