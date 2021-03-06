<template>
  <div class="submit-result">
    <div v-if="!submitted" class="not_submitted">
      <h2>Submit Result</h2>
      <p class="err_notification">{{err_notification}}</p>

      <form @submit.prevent="submitResult">
        <div class="form-group row">
          <label for="athlete-name" class="col-sm-3 col-form-label">Name</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="athlete-name" v-model="cookie.user_name" :disabled=true>
          </div>
        </div>
        <div v-if="!loading">
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
            <div v-if="full_activities.length > 0">
              <fieldset class="form-group">
                <div class="row">
                  <legend class="col-form-label col-sm-3 pt-0">Activity</legend>
                  <div class="col-sm-9 activity-container">
                    <div class="form-check activity-check" v-for="(activity, idx) in full_activities">
                      <input class="form-check-input position-static" type="radio" name="activity-radio" v-model="selected_activity" :id="activity.id" :value="idx" required>
                      <ActivityPreview :activity="activity"></ActivityPreview>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
            <div v-else>
              <p>No activities within the event date range to submit.</p>
            </div>
          </div>
          <div class="form-group row" v-if="selected_event != null">
            <div class="col-sm-12">
              <button type="submit" class="btn btn-primary float-right">Submit</button>
            </div>
          </div>
        </div>
        <div v-else>
          <p>Loading...</p>
        </div>
      </form>
    </div>
    <div v-else>
      <p>Thank you, your result has been saved.</p>
    </div>
    
  </div>
</template>

<script>
import ActivityPreview from './ActivityPreview.vue'
import API from '../services/api.js'
export default {
  name: 'SubmitResult',
  props: ['cookie'],
  components: {
    ActivityPreview
  },
  data () {
    return {
      selected_event: null,
      selected_activity: null,
      events: [{ value: null, text: 'Please select an event' }],
      activities: [],
      full_activities: [],
      backup_activities: [],
      full_events: [],
      submitted: false,
      event_date_str: '',
      loading: true,
      err_notification: ''
    }
  },
  mounted() {
    this.initialise()
  },
  watch: {
    selected_event: function() {
      let e = this.full_events[this.selected_event]
      let start = new Date(e.start_time)
      let end = new Date(e.end_time)
      this.event_date_str = start.toDateString() + ' - ' + end.toDateString()
      this.filterActivities(e)
      this.err_notification = '' 
    },
    selected_activity: function() {
      this.err_notification = ''
    }
  },
  methods: {
    initialise() {
      // Get active events
      this.getActiveEvents().then(_ => {
        // Get activities
        this.getAthleteActivities().then(_ => {
          this.loading = false
        })
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
    getAthleteActivities() {
      return new Promise((resolve, reject) => {
        API.getAthleteActivities(this.cookie.access_token).then(response => {
          if (Object.keys(response).indexOf('err') > -1) {
            console.log(response.err)
            reject()
          } else {            
            let full_activities = []
            let backup_activities = []
            response.data.forEach((ac, idx) => {
              if (ac.type == 'Run') {
                full_activities.push(ac)
                backup_activities.push(ac)
                let html_str = '<ActivityPreview :activity="full_activities[idx]"></ActivityPreview>'
                this.activities.push({"value": idx, "html": html_str})
              }
            })
            this.full_activities = full_activities
            this.backup_activities = backup_activities
            resolve()
          }
        })
      })
    },
    filterActivities(event) {
      let start_time = event.start_time
      let end_time = event.end_time

      let new_activities = []
      let new_full_activities = []
      this.backup_activities.forEach((ac, idx) => {
        let date_split = ac.start_date_local.split('T')
        let date = date_split[0].split('-')
        let time = date_split[1].split('Z')[0]
        let time_split = time.split(':')
        let date_obj = new Date(date[0], parseInt(date[1])-1, date[2], time_split[0], time_split[1], time_split[2])
        let activity_js_time = date_obj.getTime()
        if (activity_js_time >= start_time && activity_js_time < end_time) {
          new_full_activities.push(ac)
          let idx = new_full_activities.length -1
          let html_str = '<ActivityPreview :activity="full_activities[idx]"></ActivityPreview>'
          new_activities.push({"value": idx, "html": html_str})
        }
      })
      this.activities = new_activities
      this.full_activities = new_full_activities
    },
    handleDuplicateSubmitError() {
      this.err_notification = 'You have already submitted this activity for this event. Please choose another activity.'
    },
    handleGenericSubmitError() {
      this.err_notification = 'Error submitting results. Please contact Dan Cunnington.'
    },
    handleZeroActivityError() {
      this.err_notification = 'You have tried to submit an activity with 0 miles or 0 seconds. Please submit another activity.'
    },
    submitResult() {
      let selected_acc = this.full_activities[this.selected_activity]
      let selected_event = this.full_events[this.selected_event]
      let new_result = {
        "event_id": selected_event._id,
        "athlete_name": this.cookie.user_name,
        "activity_id": selected_acc.id,
        "activity_name": selected_acc.name,
        "start_date": selected_acc.start_date_local,
        "elapsed_time": selected_acc.elapsed_time,
        "moving_time": selected_acc.moving_time,
        "elevation_gain": parseInt(selected_acc.total_elevation_gain * 3.281).toString(),
        "distance": (selected_acc.distance / 1609).toFixed(2)
      }
      if (new_result.elapsed_time && new_result.moving_time && new_result.distance) {
        API.submitResult(new_result).then(response => {
          if (Object.keys(response).indexOf('err') > -1) {
            console.log(response.err)
            this.handleGenericSubmitError()
          } else {
            // Done
            this.submitted = true
            this.err_notification = ''
          }
        }, err => {
          if (Object.keys(err).indexOf('response') > -1 && err.response) {
            let msg = err.response.data
            if (Object.keys(msg).indexOf('err') > -1) {
              if (msg.err == 'result already inserted') {
                this.handleDuplicateSubmitError()
              } else {
                console.log(err)
                this.handleGenericSubmitError()
              }
            } else {
              console.log(err)
              this.handleGenericSubmitError()
            }
          } else {
            console.log(err)
            this.handleGenericSubmitError()
          }
        })
      } else {
        this.handleZeroActivityError()
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .submit-result {
    text-align: left;
  }
  .form-check {
    display: flex;
    margin-bottom: 20px;
  }

  .submit-row {
    margin: 0 auto;
  }

  .activity-container {
    max-height: 400px;
    overflow-y: scroll;
    border: solid 1px #eee;
    border-radius: 10px;
  }

  .activity-check {
    padding-top: 15px;
  }

  .event_dates {
    line-height: 40px;
  }

  p.event_dates {
    margin-bottom: 0px;
  }

  p.err_notification {
    color: red;
  }

</style>
