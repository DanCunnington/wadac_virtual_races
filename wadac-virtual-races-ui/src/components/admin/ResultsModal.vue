<template>
  <div class="resultsPreview">
    <div v-if="preview_results_set.length > 0">
      <b-table striped hover sticky-header 
        :fields="fields"
        :items="preview_results_set"
        class="results-table">
      </b-table>
    </div>  
    <div v-else class="italic">
      No results submitted
    </div>  
  </div>
</template>
<script>

export default {
  name: 'ResultsModal',
  props: [ 'preview_results_set'],
  components: {
    
  },
  data () {
    return {
      fields: [
        {"key": "athlete_name", "sortable": false},
        {"key": "activity_name", "sortable": false},
        {"key": "elapsed_time", "label": "Elapsed Time (s)", "sortable": false},
        {"key": "moving_time", "label": "Moving Time (s)", "sortable": false},
        {"key": "elevation_gain", "label": "Elevation Gain (ft)", "sortable": false},
        {"key": "distance", "label": "Distance (mi)", "sortable": false}
      ],
    }
  },
  mounted() {
    this.initialise()
  },
  watch: {
 
  },
  methods: {
    initialise() {
      console.log(this.preview_results_set)
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

