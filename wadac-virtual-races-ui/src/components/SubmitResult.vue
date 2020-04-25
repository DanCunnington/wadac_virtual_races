<template>
  <div class="submit-result">
    <div v-if="!submitted" class="not_submitted">
      <h2>Submit Result</h2>

      <form @submit.prevent="submitResult">
        <div class="form-group row">
          <label for="athlete-name" class="col-sm-3 col-form-label">Name</label>
          <div class="col-sm-9">
            <input type="text" class="form-control" id="athlete-name" v-model="cookie.user_name" :disabled=true>
          </div>
        </div>
        <div class="form-group row">
          <label for="event" class="col-sm-3 col-form-label">Event</label>
          <div class="col-sm-9">
            <b-form-select v-model="selected_event" :options="events" required></b-form-select>
          </div>
        </div>
        <fieldset class="form-group" v-if="full_activities.length > 0">
          <div class="row">
            <legend class="col-form-label col-sm-3 pt-0">Activity</legend>
            <div class="col-sm-9 activity-container">
              <div class="form-check" v-for="(activity, idx) in full_activities">
                <input class="form-check-input position-static" type="radio" name="activity-radio" v-model="selected_activity" :id="activity.id" :value="idx" required>
                <ActivityPreview :activity="activity"></ActivityPreview>
              </div>
            </div>
          </div>
        </fieldset>
        <div class="form-group row">
          <div class="col-sm-12">
            <button type="submit" class="btn btn-primary float-right">Submit</button>
          </div>
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
      events: [],
      activities: [],
      full_activities: [],
      full_events: [],
      submitted: false
    }
  },
  mounted() {
    this.initialise()
  },
  methods: {
    initialise() {
      // Get active events
      this.getActiveEvents()

      // Get activities
      this.getAthleteActivities()
    },
    getActiveEvents() {
      API.getActiveEvents().then(response => {
        if (Object.keys(response).indexOf('err') > -1) {
          console.log(response.err)
        } else {
          this.full_events = response.data
          response.data.forEach((ev, idx) => {
            this.events.push({"value": idx, "text": ev.event_name})
          })
        }
      })
    },
    getAthleteActivities() {
      API.getAthleteActivities(this.cookie.access_token).then(response => {
        if (Object.keys(response).indexOf('err') > -1) {
          console.log(response.err)
        } else {
          this.full_activities = response.data
          response.data.forEach((ac, idx) => {
            let html_str = '<ActivityPreview :activity="full_activities[idx]"></ActivityPreview>'
            this.activities.push({"value": idx, "html": html_str})
          })
        }
      })
    },
    submitResult() {
      let selected_acc = this.full_activities[this.selected_activity]
      let selected_event = this.full_events[this.selected_event]
      let new_result = {
        "event_id": selected_event._id,
        "athlete_name": this.cookie.user_name,
        "elapsed_time": selected_acc.elapsed_time,
        "moving_time": selected_acc.moving_time,
        "elevation_gain": parseInt(selected_acc.total_elevation_gain * 3.281),
        "distance": (selected_acc.distance / 1609).toFixed(2)
      }
      API.submitResult(new_result).then(response => {
        if (Object.keys(response).indexOf('err') > -1) {
          console.log(response.err)
        } else {
          // Done
          this.submitted = true
        }
      })
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
    height: 400px;
    overflow-y: scroll;
  }

</style>
