<template>
  <div class="create-event-container">
    <p class="notification">{{err_notification}}</p>
    <form class="ev-form">
        <div class="form-group row">
          <label for="name" class="col-sm-3 col-form-label">Athlete Name</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="name" v-model="athlete_name" required>
          </div>
        </div>
        <div class="form-group row">
          <label for="event" class="col-sm-3 col-form-label">Event</label>
          <div class="col-sm-9">
            <b-form-select v-model="selected_event" :options="events" required></b-form-select>
          </div>
        </div>
        <div class="form-group row" v-if="selected_event != null">
          <label for="event" class="col-sm-3 col-form-label">Event Dates</label>
          <div class="col-sm-9 event_dates">
            <p class="event_dates">{{event_date_str}}</p>
          </div>
        </div>

        <div v-if="selected_event != null">
          <div v-if="selected_event_wcr">
            <div class="form-group row">
              <label for="wcr-team" class="col-sm-3 col-form-label">Team</label>
              <div class="col-sm-9">
                <b-form-select v-model="selected_team" :options="wcr_teams" default="Please select a team" required></b-form-select>
              </div>
            </div>
            <div class="form-group row">
              <label for="wcr-stage" class="col-sm-3 col-form-label">Stage</label>
              <div class="col-sm-9">
                <b-form-select v-model="selected_stage" :options="wcr_stages" required></b-form-select>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selected_event != null">
          <div class="form-group row">
            <label for="elapsed_time" class="col-sm-3 col-form-label">Elapsed Time (s)</label>
            <div class="col-sm-9">
              <input type="text" class="form-control" id="elapsed_time" v-model="elapsed_time" required>
            </div>
          </div>

          <div class="form-group row">
            <label for="moving_time" class="col-sm-3 col-form-label">Moving Time (s)</label>
            <div class="col-sm-9">
              <input type="text" class="form-control" id="moving_time" v-model="moving_time" required>
            </div>
          </div>

          <div class="form-group row">
            <label for="distance" class="col-sm-3 col-form-label">Distance (mi)</label>
            <div class="col-sm-9">
              <input type="text" class="form-control" id="distance" v-model="distance" required>
            </div>
          </div>

          <div class="form-group row">
            <label for="elevation_gain" class="col-sm-3 col-form-label">Elevation Gain (ft)</label>
            <div class="col-sm-9">
              <input type="text" class="form-control" id="elevation_gain" v-model="elevation_gain" required>
            </div>
          </div>

        </div>

   </form>
  </div>
</template>
<script>
import API from '../../services/api.js'

export default {
  name: 'ManualResultModal',
  props: [ ],
  components: {
    
  },
  data () {
    return {
      err_notification: '',
      athlete_name: null,
      selected_event: null,
      selected_event_wcr: false,
      selected_team: null,
      selected_stage: null,
      events: [{ value: null, text: 'Please select an event', disabled: true }],
      full_events: [],
      event_date_str: '',
      wcr_teams: [],
      wcr_stages: [],
      elapsed_time: null,
      moving_time: null,
      distance: null,
      elevation_gain: null
    }
  },
  mounted() {
    this.initialise()
  },
  watch: {
    selected_event: function() {
      let e = this.full_events[this.selected_event]
      if (Object.keys(e).indexOf('wcr_event') > -1) {
        this.selected_event_wcr = e.wcr_event
      } else {
        this.selected_event_wcr = false
      }
      
      let start = new Date(e.start_time)
      let end = new Date(e.end_time)
      this.event_date_str = start.toDateString() + ' - ' + end.toDateString()
      this.err_notification = '' 
    },
  },
  methods: {
    initialise() {
      // Load WCR Data
      this.wcr_teams = API.getWCRTeams()
      this.wcr_stages = API.getWCRStages()

      this.getAllEvents()
    },

    getAllEvents() {
      return new Promise((resolve, reject) => {
        API.getAllEvents().then(response => {
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

    handleGenericSubmitError() {
      this.err_notification = 'Error submitting result. Please contact Dan Cunnington.'
    },
    validateManualResult() {
      return new Promise((resolve, reject) => {
        if (!this.athlete_name) {
          this.err_notification = 'Please enter an athlete name'
            setTimeout(() => {
                this.err_notification = ''
            }, 2000)
            return reject()
        }

        if (this.selected_event == null) {
          this.err_notification = 'Please select an event'
            setTimeout(() => {
                this.err_notification = ''
            }, 2000)
            return reject()
        }

        if (this.selected_event_wcr) {
          if (!this.selected_team) {
            this.err_notification = 'Please select a team'
              setTimeout(() => {
                  this.err_notification = ''
              }, 2000)
              return reject()
          }

          if (!this.selected_stage) {
            this.err_notification = 'Please select a stage'
              setTimeout(() => {
                  this.err_notification = ''
              }, 2000)
              return reject()
          }
        }

        if (!this.elapsed_time) {
          this.err_notification = 'Please enter elapsed time in seconds'
            setTimeout(() => {
                this.err_notification = ''
            }, 2000)
            return reject()
        }

        if (!this.moving_time) {
          this.err_notification = 'Please enter moving time in seconds'
            setTimeout(() => {
                this.err_notification = ''
            }, 2000)
            return reject()
        }

        if (!this.distance) {
          this.err_notification = 'Please enter distance in miles'
            setTimeout(() => {
                this.err_notification = ''
            }, 2000)
            return reject()
        }

        if (!this.elevation_gain) {
          this.err_notification = 'Please enter elevation gain in feet'
            setTimeout(() => {
                this.err_notification = ''
            }, 2000)
            return reject()
        }        

        let selected_event = this.full_events[this.selected_event]
        let current_date = Date.now()
        let ac_name_id = this.athlete_name+"_manual_"+current_date.toString()
        let new_result = {
          "event_id": selected_event._id,
          "athlete_name": this.athlete_name,
          "activity_id": ac_name_id,
          "activity_name": ac_name_id,
          "start_date": current_date,
          "elapsed_time": this.elapsed_time,
          "moving_time": this.moving_time,
          "elevation_gain": this.elevation_gain,
          "distance": this.distance,
          "wcr": false
        }
        // Add team and stage in for WCR
        if (this.selected_event_wcr) {
          new_result.wcr = true
          new_result.wcr_team = this.selected_team
          new_result.wcr_stage = this.selected_stage
        }
        return resolve(new_result)
      })
    },
    submitManualResult() {
      return new Promise((resolve, reject) => {
        this.validateManualResult().then(new_result => {
          API.submitResult(new_result).then(response => {
            if (Object.keys(response).indexOf('err') > -1) {
              console.log(response.err)
              this.handleGenericSubmitError()
              reject()
            } else {
              // Done
              this.err_notification = ''
              resolve()
            }
          })
        })
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .admin {
    margin-top: 40px;
    margin: 0 auto;
    max-width: 90%;
  }

  .form-container {
    max-width: 400px;
    margin: 0 auto;
  }

  .ev-form {
    max-width: 90%;
    margin: 0 auto;
  }

  h1.hover-cursor {
    cursor: pointer
  }

  p.notification {
    color: red;
  }
</style>

