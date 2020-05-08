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
  props: [ 'preview_results_set', 'wcr'],
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
      console.log(this.preview_results_set)
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

