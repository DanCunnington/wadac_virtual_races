<template>
  <div class="admin">
    <h1 @click="$router.push('/')" class="hover-cursor">WADAC Virtual Racing</h1>
    <p>Admin Page</p>
    <div class="form-container">
        <form @submit.prevent="login" v-if="!logged_in">
            <div class="form-group row">
              <label for="password" class="col-sm-3 col-form-label">Password</label>
              <div class="col-sm-9">
                <input type="password" class="form-control" id="password" v-model="password">
              </div>
            </div>
            <div class="form-group row">
              <div class="col-sm-12">
                <button type="submit" class="btn btn-primary float-right">Login</button>
              </div>
            </div>
         </form>
    </div>
     <div v-if="logged_in">
        <p class="notification">{{notification}}</p>
        <div class="row">
            <div class="col-sm-6">
                <h2>Create Event</h2>
                <form @submit.prevent="createEvent" class="ev-form" >
                    <div class="form-group row">
                      <label for="name" class="col-sm-3 col-form-label">Name</label>
                      <div class="col-sm-9">
                        <input type="text" class="form-control" id="name" v-model="ev_name" required>
                      </div>
                    </div>
                    <div class="form-group row">
                        <label for="start-datepicker" class="col-sm-3 col-form-label">Start Date</label>
                        <div class="col-sm-9">
                            <b-form-datepicker id="start-datepicker" v-model="ev_start_date" :state="start_state" class="mb-2"></b-form-datepicker>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="end-datepicker" class="col-sm-3 col-form-label">End Date</label>
                        <div class="col-sm-9">
                            <b-form-datepicker id="end-datepicker" v-model="ev_end_date" :state="end_state" class="mb-2"></b-form-datepicker>
                        </div>
                    </div>
                    <div class="form-group row">
                      <div class="col-sm-12">
                        <button type="submit" class="btn btn-primary float-right">Create</button>
                      </div>
                    </div>
                 </form>
            </div>
            <div class="col-sm-6">
                <h2>Get Results</h2>
                <form @submit.prevent="downloadResults" class="ev-form" >
                    <div class="form-group row">
                      <label for="event" class="col-sm-3 col-form-label">Event</label>
                      <div class="col-sm-9">
                        <b-form-select v-model="selected_event" :options="events" required></b-form-select>
                      </div>
                    </div>
                    
                    <div class="form-group row">
                      <div class="col-sm-12">
                        <button type="submit" class="btn btn-primary float-right">Download</button>
                      </div>
                    </div>
                 </form>
            </div>
        </div>
     </div>
  </div>
</template>
<script>
import API from '../services/api.js'

export default {
  name: 'Admin',
  props: [],
  components: {
    
  },
  data () {
    return {
      logged_in: false,
      password: '',
      ev_name: '',
      ev_start_date: null,
      ev_end_date: null,
      notification: '',
      events: [{ value: null, text: 'Please select an event' }],
      full_events: [],
      selected_event: null,
      start_state: null,
      end_state: null
    }
  },
  mounted() {
    this.initialise()
  },
  watch: {
    ev_start_date: function(val) {
        if (val) {
            this.start_state = null
        }
    },
    ev_end_date: function(val) {
        if (val) {
            this.end_state = null
        }
    }
  },
  methods: {
    initialise() {
      this.getEvents()
    },
    login() {
        API.isAdmin({"password": this.password}).then(response => {
            if (Object.keys(response).indexOf('err') > -1) {
              console.log(response.err)
            } else {
              this.logged_in = response.data.logged_in
            }
        })
    },
    getEvents() {
        API.getAllEvents().then(response => {
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
    createEvent() {
        if (!this.ev_start_date) {
            this.notification = 'Please select an event start date'
            this.start_state = false
            return setTimeout(() => {
                this.notification = ''
            }, 2000)
        }
        if (!this.ev_end_date) {
            this.notification = 'Please select an event end date'
            this.end_state = false
            return setTimeout(() => {
                this.notification = ''
            }, 2000)
        }
        let picked_start = this.ev_start_date.split('-')
        let picked_end = this.ev_end_date.split('-')
        let start_date = new Date(parseInt(picked_start[0]), parseInt(picked_start[1])-1, parseInt(picked_start[2])).getTime()
        let end_date = new Date(parseInt(picked_end[0]), parseInt(picked_end[1])-1, parseInt(picked_end[2]), 23, 59, 59).getTime()

        let new_event = {
            "name": this.ev_name,
            "start_time": start_date,
            "end_time": end_date
        }
        this.ev_name = ''
        this.ev_start_date = ''
        this.ev_end_date = ''
        API.newEvent(new_event).then(response => {
            if (Object.keys(response).indexOf('err') > -1) {
                console.log(response.err)
            } else {
                this.notification = 'Event '+this.ev_name +' created.'
                setTimeout(() => {
                    this.notification = ''
                }, 2000)
            }
        })
    },
    downloadResults() {
        let evt = this.full_events[this.selected_event]
        API.eventResults(evt._id).then(response => {
            if (Object.keys(response).indexOf('err') > -1) {
                console.log(response.err)
            } else {
                console.log(response.data)
                let headers = ['athlete_name', 'activity_name', 'distance_miles', 'moving_time_seconds', 'elapsed_time_seconds', 'elevation_gain_ft']
                
                // Download the results as csv
                let tmp_csv = [headers]
                response.data.forEach(r => {
                    let activity_name = ''
                    if (Object.keys(r).indexOf('activity_name') > -1) {
                        activity_name = r['activity_name']
                    }
                    tmp_csv.push([r['athlete_name'], activity_name, r['distance'], r['moving_time'], r['elapsed_time'], r['elevation_gain']])
                })
                console.log(tmp_csv)
                let csvContent = tmp_csv.map(e => e.join(",")).join("\n");
                var download = function(content, fileName, mimeType) {
                    var a = document.createElement('a');
                    mimeType = mimeType || 'application/octet-stream';
                    if (navigator.msSaveBlob) { // IE10
                      navigator.msSaveBlob(new Blob([content], {
                        type: mimeType
                      }), fileName);
                    } else if (URL && 'download' in a) { //html5 A[download]
                      a.href = URL.createObjectURL(new Blob([content], {
                        type: mimeType
                      }));
                      a.setAttribute('download', fileName);
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    } else {
                      location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
                    }
                }
                download(csvContent, evt.event_name+'_results.csv', 'text/csv;encoding:utf-8');
            }
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
    max-width: 80%;
    margin: 0 auto;
  }

  h1.hover-cursor {
    cursor: pointer
  }
</style>

