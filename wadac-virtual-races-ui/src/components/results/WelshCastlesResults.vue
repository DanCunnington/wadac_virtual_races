<template>
  <div class="wcr-results">
    <div class="team-stage-container">
      <div class="row">
        <div class="team-results col-lg-5">
          <h5 class="wcr-team-head">Current Team Standings</h5>
          <p class="sm-it">Note. These times are calculated based on the current results submitted and therefore may not be complete. Final results will be circulated when the results are available.</p>
          <div v-if="wcr_total_team_results.length > 0">
            <b-table striped hover sticky-header bordered
              :fields="fields"
              :items="wcr_total_team_results"
              :sort-by="'total_time'"
              class="wcr-results-table">

              <template v-slot:cell(pos)="data">
                <span v-html="data.index + 1"></span>
              </template>
            </b-table>
          </div>
          <div v-else>
            <p class="sm-it">Team standings will be available when results are submitted.</p>
          </div>
        </div>
        <div class="stage-results col-lg-7">
          <h5 class="wcr-team-head">Stage Results</h5>
          <p class="sm-it">The following results have been scaled to the corresponding 2019 Welsh Castles stage</p>
          <div class="stage-select-container">
            <b-form-select v-model="selected_stage" :options="wcr_stages" required></b-form-select>
            <div v-if="selected_stage">
              <div v-if="!stage_results_missing">
                <div class="event-stats">
                  <p><span class="stat-label">Distance:</span> <span class="ref-distance">{{selected_stage_distance}}</span> mi</p>
                  <p><span class="stat-label">Elevation Gain:</span> <span class="ref-distance">{{selected_stage_elevation_gain}}</span> ft</p>
                  <p><span class="stat-label">Net Elevation Change:</span> <span class="ref-distance">{{selected_stage_elevation_change}}</span> ft</p>
                </div>
                <b-table striped hover sticky-header bordered
                  :fields="stage_fields"
                  :items="wcr_selected_stage_results"
                  :sort-by="'adjusted_time'"
                  class="wcr-stage-table">

                  <template v-slot:cell(team)="data">
                    <span v-html="data.value" v-b-tooltip.hover :title="data.item.team_display"></span>
                  </template>

                  <template v-slot:cell(pos)="data">
                    <span v-html="data.index + 1"></span>
                  </template>
                </b-table>
              </div>
              <div v-else>
                <p class="sm-it">No stage results submitted yet. Please check back later.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import API from '../../services/api.js'

export default {
  name: 'WelshCastlesResults',
  props: ['preview_results_set'],
  components: {
    
  },
  data () {
    return {
      wcr_teams: [],
      wcr_all_results_by_team: {},
      wcr_all_results_by_stage: {},
      fields: [],
      stage_fields: [],
      wcr_total_team_results: [],
      wcr_selected_stage_results: [],
      wcr_stages: [],
      selected_stage: null,
      selected_stage_distance: null,
      selected_stage_elevation_gain: null,
      selected_stage_elevation_change: null,
      wcr_team_values_to_display: {},
      wcr_stage_stats_to_select: {},
      stage_results_missing: true
    }
  },
  watch: {
    selected_stage: function() {
      this.showStageResults()
    }
  },
  mounted() {
    this.initialise()
  },
  methods: {
    initialise() {
      this.wcr_teams = API.getWCRTeams()
      this.wcr_stages = API.getWCRStages()
      this.fields = [
        {"key": "pos", "sortable": false}, 
        {"key": "team", "sortable": false}, 
        {"key": "total_time", "sortable": false}
      ]
      this.stage_fields = [
        {"key": "pos", "sortable": false}, 
        {"key": "team", "sortable": false}, 
        {"key": "athlete", "sortable": false}, 
        {"key": "adjusted_time", "sortable": false}
      ]

      // Sort results per team and stage
      this.preview_results_set.forEach(r => {
        // Calculate adjusted time
        let adj_obj = API.calculateAdjustedWCRTime(parseInt(r['wcr_stage']), parseFloat(r['distance']), 
                parseFloat(r['elapsed_time']), parseFloat(r['elevation_gain']), parseFloat(r['net_elevation_change']))

        // Per team
        if (adj_obj['adj_time'] <0) {
          console.log(r)
        }
        if (Object.keys(this.wcr_all_results_by_team).indexOf(r.wcr_team) > -1) {
          this.wcr_all_results_by_team[r.wcr_team] += adj_obj['adj_time']
        } else {
          this.wcr_all_results_by_team[r.wcr_team] = adj_obj['adj_time']
        }

        // Per stage
        r.adjusted_time = adj_obj['hms_str']
        if (Object.keys(this.wcr_all_results_by_stage).indexOf(String(r.wcr_stage)) > -1) {
          this.wcr_all_results_by_stage[r.wcr_stage].push(r)
        } else {
          this.wcr_all_results_by_stage[r.wcr_stage] = [r]
        }
      })

      this.calculateAndUpdateTeamResults()

      // Build dict for quick team display
      this.wcr_teams.forEach(t => {
        this.wcr_team_values_to_display[t['value']] = {"short": t['short'], "full":t['text']}
      })

      // Build dict for quick stage reference display
      this.wcr_stages.forEach(day => {
        if (!day.disabled) {
          day.options.forEach(s => {
            this.wcr_stage_stats_to_select[s.value] = {
              "ref_distance": s.ref_distance,
              "ref_elevation_gain": s.ref_elevation_gain,
              "ref_elevation_change": s.ref_elevation_change
            }
          })
        }
      })

    },
    calculateAndUpdateTeamResults() {
      this.wcr_teams.forEach(t => {
        if (!t.disabled) {
          let tt = this.wcr_all_results_by_team[t['value']]
          let h = parseInt(tt / 3600).toString()
          let m = parseInt((tt % 3600)/60).toString()
          let s = parseInt((tt % 3600)%60).toString()
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
          if (!isNaN(tt)) {
            this.wcr_total_team_results.push({"pos": 0, "team": t['text'], "total_time": hms_str})
          }
        }
      })      
    },
    showStageResults() {
      let sr = this.wcr_all_results_by_stage[this.selected_stage]
      this.wcr_selected_stage_results = []

      //show stats
      let ss = this.wcr_stage_stats_to_select[this.selected_stage]
      console.log(this.wcr_stage_stats_to_select)
      this.selected_stage_distance = ss.ref_distance
      this.selected_stage_elevation_change = ss.ref_elevation_change
      this.selected_stage_elevation_gain = ss.ref_elevation_gain

      if (sr) {
        this.stage_results_missing = false
        sr.forEach(r => {
          this.wcr_selected_stage_results.push({
            "pos": 0,
            "team": this.wcr_team_values_to_display[r.wcr_team].short,
            "team_display": this.wcr_team_values_to_display[r.wcr_team].full,
            "athlete": r.athlete_name,
            "adjusted_time": r.adjusted_time

          })
        })
      } else {
        this.stage_results_missing = true
        this.wcr_selected_stage_results = []
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
 .wcr-results {
    margin-top: 40px;
    margin: 0 auto;
    max-width: 100%;
    margin-bottom: 40px;
 }

 .team-stage-container {
  margin-top: 60px;
  margin-bottom: 60px;
 }

 .stage-select-container {
  max-width: 80%;
  margin: 0 auto;
 }

 h5.wcr-team-head {
  margin-bottom: 20px;
 }

 p.sm-it {
  margin-top: 20px;
  font-style: italic;
  font-size: small;
 }

 @media (max-width: 992px) { 
  .wcr-results-table {
    margin-bottom: 40px;
  }
 }

  .wcr-results-table {
    max-height: 450px;
  }

  .wcr-results-table tbody {
    height: 100%;
  }

  .wcr-stage-table {
    max-height: 450px;
  }

  .wcr-stage-table tbody {
    height: 100%;
  }

  p.net-chng {
    margin: 0 auto;
    max-width: 100%;
  }

  .event-stats {
    display: flex;
    margin: 0 auto;
    justify-content: space-between;
    font-style: italic;
    font-size: small;
    margin-top: 20px;
  }

  .stat-label {
    font-weight: bold;
  }

</style>

