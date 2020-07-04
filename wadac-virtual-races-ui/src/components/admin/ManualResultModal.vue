<template>
  <div class="create-event-container">
    <p class="notification">{{err_notification}}</p>
    <form class="ev-form">
        <div class="form-group row">
          <label for="name" class="col-sm-4 col-form-label">Athlete Name</label>
          <div class="col-sm-8">
            <b-form-input id="name" :state="name_state" v-model="athlete_name"></b-form-input>
          </div>
        </div>
        <div class="form-group row">
          <label for="event" class="col-sm-4 col-form-label">Event</label>
          <div class="col-sm-8">
            <b-form-select v-model="selected_event" :options="events" :state="event_state" required></b-form-select>
          </div>
        </div>
        <div class="form-group row" v-if="selected_event != null">
          <label for="event" class="col-sm-4 col-form-label">Event Dates</label>
          <div class="col-sm-8 event_dates">
            <p class="event_dates">{{event_date_str}}</p>
          </div>
        </div>
        <div class="form-group row" v-if="selected_event != null">
            <label for="checkbox-1" class="col-sm-4 col-form-label">Followed Set Course?</label>
            <div class="col-sm-8">
              <b-form-checkbox
                id="checkbox-1"
                v-model="followed_set_course"
                name="checkbox-1"
                value="yes"
                unchecked-value="no"
                switch
                size="lg"
              > 
              </b-form-checkbox>
            </div>
          </div>

        <div v-if="selected_event != null">
          <div v-if="selected_event_wcr">
            <div class="form-group row">
              <label for="wcr-team" class="col-sm-4 col-form-label">Team</label>
              <div class="col-sm-8">
                <b-form-select v-model="selected_team" :options="wcr_teams" :state="team_state" default="Please select a team" required></b-form-select>
              </div>
            </div>
            <div class="form-group row">
              <label for="wcr-stage" class="col-sm-4 col-form-label">Stage</label>
              <div class="col-sm-8">
                <b-form-select v-model="selected_stage" :options="wcr_stages" :state="stage_state" required></b-form-select>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selected_event != null">
          <div class="form-group row">
            <label for="elapsed_time" class="col-sm-4 col-form-label">Elapsed Time</label>
            <div class="hms-container col-sm-8">
              <div class="hms-inner">
                <b-form-input id="elapsed_time_h" v-model="elapsed_time_h"></b-form-input>
                <div class="hms-units">hrs</div>
              </div>
              <div class="hms-inner">
                <b-form-input id="elapsed_time_m" v-model="elapsed_time_m"></b-form-input>
                <div class="hms-units">mins</div>
              </div>
              <div class="hms-inner">
                <b-form-input id="elapsed_time_s" v-model="elapsed_time_s"></b-form-input>
                <div class="hms-units">secs</div>
              </div>
            </div>
          </div>

          <div class="form-group row">
            <label for="elapsed_time" class="col-sm-4 col-form-label">Moving Time</label>
            <div class="hms-container col-sm-8">
              <div class="hms-inner">
                <b-form-input id="moving_time_h" v-model="moving_time_h"></b-form-input>
                <div class="hms-units">hrs</div>
              </div>
              <div class="hms-inner">
                <b-form-input id="moving_time_m" v-model="moving_time_m"></b-form-input>
                <div class="hms-units">mins</div>
              </div>
              <div class="hms-inner">
                <b-form-input id="moving_time_s" v-model="moving_time_s"></b-form-input>
                <div class="hms-units">secs</div>
              </div>
            </div>
          </div>

          <div class="form-group row">
            <label for="distance" class="col-sm-4 col-form-label">Distance (mi)</label>
            <div class="col-sm-8">
              <b-form-input id="distance" :state="distance_state" v-model="distance"></b-form-input>
            </div>
          </div>

          <div class="form-group row">
            <label for="elevation_gain" class="col-sm-4 col-form-label">Elevation Gain (ft)</label>
            <div class="col-sm-8">
              <b-form-input id="elevation_gain" :state="eg_state" v-model="elevation_gain"></b-form-input>
            </div>
          </div>

          <div class="form-group row">
            <label for="elevation_change" class="col-sm-4 col-form-label">Net Elevation Change (ft)</label>
            <div class="col-sm-8">
              <b-form-input id="elevation_change" :state="ec_state" v-model="elevation_change"></b-form-input>
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
  props: [ 'events_type' ],
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
      elapsed_time_h: 0,
      elapsed_time_m: 0,
      elapsed_time_s: 0,
      moving_time_h: 0,
      moving_time_m: 0,
      moving_time_s: 0,
      moving_time: null,
      distance: null,
      elevation_gain: null,
      elevation_change: null,
      name_state: null,
      event_state: null,
      team_state: null,
      stage_state: null,
      distance_state: null,
      eg_state: null,
      ec_state: null,
      events_fn: null,
      followed_set_course: "no"
    }
  },
  mounted() {
    this.initialise()
  },
  watch: {
    athlete_name: function(val) {
      if (val) {
        this.name_state = null
      }
    },
    selected_event: function() {
      this.event_state = null
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
    selected_team: function(val) {
      if (val) {
        this.team_state = null
      }
    },
    selected_stage: function(val) {
      if (val) {
        this.stage_state = null
      }
    },
    distance: function(val) {
      if (val) {
        this.distance_state = null
      }
    },
    elevation_gain: function(val) {
      if (val) {
        this.eg_state = null
      }
    }, 
    elevation_change: function(val) {
      if (val) {
        this.ec_state = null
      }
    }
  },
  methods: {
    initialise() {
      // Load WCR Data
      this.wcr_teams = API.getWCRTeams()
      this.wcr_stages = API.getWCRStages()

      if (this.events_type == 'all') {
        this.events_fn = API.getAllEvents
      } else {
        this.events_fn = API.getActiveEvents
      }

      this.getEvents()
    },

    getEvents() {
      return new Promise((resolve, reject) => {
        this.events_fn().then(response => {
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
    checkET() {
      let elapsed_time = (3600*this.elapsed_time_h) + (60*this.elapsed_time_m) + this.elapsed_time_s
      return (elapsed_time > 0)
    },
    checkMT() {
      let moving_time = (3600*this.moving_time_h) + (60*this.moving_time_m) + this.moving_time_s
      return (moving_time > 0)
    },

    handleGenericSubmitError() {
      this.err_notification = 'Error submitting result. Please contact Dan Cunnington.'
    },
    validateManualResult() {
      return new Promise((resolve, reject) => {
        if (!this.athlete_name) {
          this.err_notification = 'Please enter an athlete name'
          this.name_state = false
            setTimeout(() => {
                this.err_notification = ''
            }, 2000)
            return reject()
        }

        if (this.selected_event == null) {
          this.err_notification = 'Please select an event'
          this.event_state = false
            setTimeout(() => {
                this.err_notification = ''
            }, 2000)
            return reject()
        }

        if (this.selected_event_wcr) {
          if (!this.selected_team) {
            this.err_notification = 'Please select a team'
            this.team_state = false
              setTimeout(() => {
                  this.err_notification = ''
              }, 2000)
              return reject()
          }

          if (!this.selected_stage) {
            this.err_notification = 'Please select a stage'
            this.stage_state = false
              setTimeout(() => {
                  this.err_notification = ''
              }, 2000)
              return reject()
          }
        }

        // Calculate elapsed time in seconds
        let elapsed_time = (3600*parseFloat(this.elapsed_time_h)) + (60*parseFloat(this.elapsed_time_m)) + parseFloat(this.elapsed_time_s)
        if (elapsed_time <= 0 || isNaN(elapsed_time)) {
          this.err_notification = 'Please enter elapsed time'
            setTimeout(() => {
                this.err_notification = ''
            }, 2000)
            return reject()
        }

        let moving_time = (3600*parseFloat(this.moving_time_h)) + parseFloat((60*this.moving_time_m)) + parseFloat(this.moving_time_s)
        if (moving_time <= 0 || isNaN(moving_time)) {
          this.err_notification = 'Please enter moving time'
            setTimeout(() => {
                this.err_notification = ''
            }, 2000)
            return reject()
        }

        if (!this.distance) {
          this.err_notification = 'Please enter distance in miles'
          this.distance_state = false
            setTimeout(() => {
                this.err_notification = ''
            }, 2000)
            return reject()
        }

        if (!this.elevation_gain) {
          this.err_notification = 'Please enter elevation gain in feet'
          this.eg_state = false
            setTimeout(() => {
                this.err_notification = ''
            }, 2000)
            return reject()
        } 

        if (!this.elevation_change) {
          this.err_notification = 'Please enter net elevation change in feet'
          this.ec_state = false
            setTimeout(() => {
                this.err_notification = ''
            }, 2000)
            return reject()
        }        

        let selected_event = this.full_events[this.selected_event]
        let d = new Date()
        let current_date = d.toISOString().split('T')[0]+'T'+d.toLocaleTimeString()+'Z'
        let ac_name_id = this.athlete_name+"_manual_"+current_date.toString()
        let new_result = {
          "event_id": selected_event._id,
          "athlete_name": this.athlete_name,
          "activity_id": ac_name_id,
          "activity_name": ac_name_id,
          "start_date": current_date,
          "elapsed_time": elapsed_time,
          "moving_time": moving_time,
          "elevation_gain": this.elevation_gain,
          "manual_elevation_change": this.elevation_change,
          "distance": this.distance,
          "wcr": false,
          "followed_set_course": this.followed_set_course
        }
        console.log(new_result)
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

  .hms-container {
    display: flex;
    padding-top: 7px;
  }

  .hms-inner {
    display: flex;
  }

  .hms-inner input {
    max-width: 50%;
  }

  .hms-inner {
    line-height: 40px;
  }

  .hms-units {
    font-size: small;
    margin-left: 5px;
  }

  .ev-form {
    max-width: 90%;
    margin: 0 auto;
  }

  h1.hover-cursor {
    cursor: pointer
  }

  p.notification {
    color: #dc3545;;
  }

  p.event_dates {
    margin-bottom: 0;
    line-height: 40px;
    font-size: smaller;
  }

  .custom-switch {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
</style>

