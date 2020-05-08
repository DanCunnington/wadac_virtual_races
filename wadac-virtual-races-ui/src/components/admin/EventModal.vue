<template>
  <div class="create-event-container">
    <p class="notification">{{notification}}</p>
    <form @submit.stop.prevent="createEvent" class="ev-form" >
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
      ev_name: '',
      ev_start_date: null,
      ev_end_date: null,
      start_state: null,
      end_state: null,
      notification: ''
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
      if (this.existing) {
        this.ev_name = this.existing.ev_name
        this.ev_start_date = this.existing.ev_start_date
        this.ev_end_date = this.existing.ev_end_date
      }
    },
    validateEvent() {
      return new Promise((resolve, reject) => {
        if (!this.ev_start_date) {
            this.notification = 'Please select an event start date'
            this.start_state = false
            setTimeout(() => {
                this.notification = ''
            }, 2000)
            reject()
        }
        if (!this.ev_end_date) {
            this.notification = 'Please select an event end date'
            this.end_state = false
            setTimeout(() => {
                this.notification = ''
            }, 2000)
            reject()
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
        resolve(new_event)
      })
    },
    createEvent() {
      return new Promise((resolve, reject) => {
        this.validateEvent().then(new_event => {
          this.ev_name = ''
          this.ev_start_date = ''
          this.ev_end_date = ''
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
                  resolve(new_event)
              }
          })
        }, err => {
          // modal will still show and errors populated from validation
        })
      })
    },
    editEvent() {
      return new Promise((resolve, reject) => {
        this.validateEvent().then(new_event => {
          this.ev_name = ''
          this.ev_start_date = ''
          this.ev_end_date = ''
          API.editEvent(this.existing.ev_id, new_event).then(response => {
            if (Object.keys(response).indexOf('err') > -1) {
                console.log(response.err)
                this.notification = 'Error: Event not edited.'
                setTimeout(() => {
                    this.notification = ''
                }, 2000)
            } else {
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
</style>

