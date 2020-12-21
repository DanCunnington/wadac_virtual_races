<template>
  <div class="create-event-container">
    <p class="notification">{{notification}}</p>
    <form @submit.stop.prevent="createEvent" class="ev-form" >
        <div class="form-group row">
          <label for="name" class="col-sm-3 col-form-label">Name</label>
          <div class="col-sm-9">
            <b-form-input id="name" :state="name_state" v-model="ev_name"></b-form-input>
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
            <label for="wcr-check" class="col-sm-5 col-form-label">Welsh Castles Event?</label>
            <div class="col-sm-4 wcr-switch">
              <b-form-checkbox
                id="wcr-check"
                v-model="wcr_event"
                name="wcr-check"
                switch
                size="lg"
              ></b-form-checkbox>
            </div>
        </div>
        <div class="form-group row">
            <label for="duathlon-check" class="col-sm-5 col-form-label">Duathlon Event?</label>
            <div class="col-sm-4 duathlon-switch">
              <b-form-checkbox
                id="duathlon-check"
                v-model="duathlon_event"
                name="duathlon-check"
                switch
                size="lg"
              ></b-form-checkbox>
            </div>
        </div>
        <div v-if="!wcr_event && !duathlon_event">
          <div class="form-group row">
            <label for="distance" class="col-sm-6 col-form-label">Event Distance (mi)</label>
            <div class="col-sm-6">
              <b-form-input id="distance" :state="distance_state" v-model="ev_distance"></b-form-input>
            </div>
          </div>
          <div class="form-group row">
            <label for="elevation_gain" class="col-sm-6 col-form-label">Event Elevation Gain (ft)</label>
            <div class="col-sm-6">
              <b-form-input id="elevation_gain" :state="eg_state" v-model="ev_elevation_gain"></b-form-input>
            </div>
          </div>
          <div class="form-group row">
            <label for="elevation_change" class="col-sm-6 col-form-label">Event Net Elevation Change (ft)</label>
            <div class="col-sm-6">
              <b-form-input id="elevation_change" :state="ec_state" v-model="ev_elevation_change"></b-form-input>
            </div>
          </div>
        </div>
     </form>
  </div>
</template>
<script>
import API from '../../services/api.js'

export default {
  name: 'EventModal',
  props: [ 'existing'],
  components: {
    
  },
  data () {
    return {
      ev_name: null,
      ev_start_date: null,
      ev_end_date: null,
      ev_distance: null,
      ev_elevation_gain: null,
      ev_elevation_change: null,
      start_state: null,
      end_state: null,
      name_state: null,
      distance_state: null,
      eg_state: null,
      ec_state: null,
      wcr_event: false,
      duathlon_event: false,
      notification: ''
    }
  },
  mounted() {
    this.initialise()
  },
  watch: {
    ev_name: function(val) {
      if (val) {
        this.name_state = null
      }
    },
    ev_start_date: function(val) {
        if (val) {
            this.start_state = null
        }
    },
    ev_end_date: function(val) {
        if (val) {
            this.end_state = null
        }
    },
    ev_distance: function(val) {
      if (val) {
        this.distance_state = null
      }
    },
    ev_elevation_gain: function(val) {
      if (val) {
        this.eg_state = null
      }
    },
    ev_elevation_change: function(val) {
      if (val) {
        this.ec_state = null
      }
    }
  },
  methods: {
    initialise() {
      if (this.existing) {
        console.log(this.existing)
        this.ev_name = this.existing.ev_name
        this.ev_start_date = this.existing.ev_start_date
        this.ev_end_date = this.existing.ev_end_date
        this.wcr_event = this.existing.ev_wcr
        this.duathlon_event = this.existing.ev_duathlon
        this.ev_distance = this.existing.ev_distance
        this.ev_elevation_gain = this.existing.ev_elevation_gain
        this.ev_elevation_change = this.existing.ev_elevation_change
      }
    },
    validateEvent() {
      return new Promise((resolve, reject) => {
        let picked_start = this.ev_start_date.split('-')
        let picked_end = this.ev_end_date.split('-')
        let start_date = new Date(parseInt(picked_start[0]), parseInt(picked_start[1])-1, parseInt(picked_start[2])).getTime()
        let end_date = new Date(parseInt(picked_end[0]), parseInt(picked_end[1])-1, parseInt(picked_end[2]), 23, 59, 59).getTime()

        if (!this.ev_name) {
          this.notification = 'Please enter an event name'
          this.name_state = false
            setTimeout(() => {
                this.notification = ''
            }, 2000)
            return reject()
        }
        if (!this.ev_start_date) {
            this.notification = 'Please select an event start date'
            this.start_state = false
            setTimeout(() => {
                this.notification = ''
            }, 2000)
            return reject()
        }
        if (!this.ev_end_date) {
            this.notification = 'Please select an event end date'
            this.end_state = false
            setTimeout(() => {
                this.notification = ''
            }, 2000)
            return reject()
        }

        if (this.end_date < this.start_date) {
          this.notification = 'Please ensure the event end date is after the start date'
          this.end_state = false
          setTimeout(() => {
              this.notification = ''
          }, 2000)
          return reject()
        }

        if (!this.wcr_event && !this.duathlon_event) {
          if (!this.ev_distance) {
            this.notification = 'Please enter an event distance in miles'
            this.distance_state = false
            setTimeout(() => {
                this.notification = ''
            }, 2000)
            return reject()
          }

          if (!this.ev_elevation_gain) {
            this.notification = 'Please enter an event elevation gain in feet'
            this.eg_state = false
            setTimeout(() => {
                this.notification = ''
            }, 2000)
            return reject()
          }

          if (!this.ev_elevation_change) {
            this.notification = 'Please enter a net event elevation change in feet'
            this.ec_state = false
            setTimeout(() => {
                this.notification = ''
            }, 2000)
            return reject()
          }
        }

        let new_event = {
            "name": this.ev_name,
            "start_time": start_date,
            "end_time": end_date,
            "wcr_event": this.wcr_event,
            "duathlon_event": this.duathlon_event
        }

        if (!this.wcr_event && !this.duathlon_event) {
          new_event.distance = this.ev_distance
          new_event.elevation_gain = this.ev_elevation_gain
          new_event.elevation_change = this.ev_elevation_change
        }
        resolve(new_event)
      })
    },
    createEvent() {
      return new Promise((resolve, reject) => {
        this.validateEvent().then(new_event => {
          API.newEvent(new_event).then(response => {
              if (Object.keys(response).indexOf('err') > -1) {
                  console.log(response.err)
                  this.notification = 'Error: Event not created.'
                  setTimeout(() => {
                      this.notification = ''
                  }, 2000)
              } else {
                  // this.notification = 'Event '+this.ev_name +' created.'
                  // setTimeout(() => {
                  //     this.notification = ''
                  // }, 2000)
                  this.ev_name = ''
                  this.ev_start_date = ''
                  this.ev_end_date = ''
                  resolve(new_event)
              }
          }, err => {
            console.log(err.data)
          })
        }, err => {
          // modal will still show and errors populated from validation
        })
      })
    },
    editEvent() {
      return new Promise((resolve, reject) => {
        this.validateEvent().then(new_event => {
          console.log(new_event)
          API.editEvent(this.existing.ev_id, new_event).then(response => {
            if (Object.keys(response).indexOf('err') > -1) {
                console.log(response.err)
                this.notification = 'Error: Event not edited.'
                setTimeout(() => {
                    this.notification = ''
                }, 2000)
            } else {
                this.ev_name = ''
                this.ev_start_date = ''
                this.ev_end_date = ''
                resolve(new_event)
            }
          }, err => {
            // modal will still show and errors populated from validation
          });
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

  .wcr-switch, .duathlon-switch {
    margin-top: 4px;
  }

  .notification {
    color: #dc3545;
  }
</style>

