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
    <div v-if="logged_in" class="table-container">
      <div class="text-left">

        <!-- Modals -->
        <b-button v-b-modal.modal-1 class="pull-left" variant="primary" @click="resetModalText">Create Event</b-button>
        <b-modal id="modal-1" :ok-title="create_or_edit_button" :title="create_or_edit_title" @ok="handleOk">
          <EventModal ref="event_modal" :existing="existing"></EventModal>
        </b-modal>

        <b-modal id="delete-modal" :title="modal_delete_title" @ok="handleDelete">
          <p>Are you sure?</p>
          <template v-slot:modal-footer="{ ok, cancel, hide }">
            <b-button @click="cancel()">
              No, Cancel
            </b-button>
            <b-button variant="danger" @click="ok()">
              Yes, delete
            </b-button>
          </template>
        </b-modal>

        
        <b-modal id="results-modal" class="results-modal" size="full" :title="modal_results_title">
          <ResultsModal ref="results_modal" :preview_results_set="preview_results_set"></ResultsModal>
          <template v-slot:modal-footer="{ hide }">
            <b-button variant="outline-secondary" @click="hide()">
              Close
            </b-button>
          </template>
          
        </b-modal>
      </div>
      <b-table v-if="events.length > 0" striped hover sticky-header 
        :fields="fields"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :items="events"
        class="events-table">

        <template v-slot:cell(name)="data">
          <span v-html="data.value"></span>
        </template>

        <template v-slot:cell(start_date)="data">
          <span v-html="data.value"></span>
        </template>

        <template v-slot:cell(end_date)="data">
          <span v-html="data.value"></span>
        </template>

        <template v-slot:cell(status)="data">
          <span v-html="data.value"></span>
        </template>

        <template v-slot:cell(results)="data">
          <div class="results-icons">
            <b-icon-eye class="ev-icon" v-b-tooltip.hover title="Preview" @click="previewResults(data.item)"></b-icon-eye>
            <b-icon-download class="ev-icon" v-b-tooltip.hover title="CSV Download" @click="downloadResults(data.item)"></b-icon-download>
          </div>
        </template>

        <template v-slot:cell(controls)="data">
          <div class="icon-container">
            <b-icon-pencil-square class="ev-icon" v-b-tooltip.hover title="Edit Event" @click="editEvent(data.item)"></b-icon-pencil-square>
            <b-icon-trash class="ev-icon" v-b-tooltip.hover title="Delete Event" @click="deleteEvent(data.item)"></b-icon-trash>
          </div>
        </template>
      </b-table>   

    </div>
  </div>
</template>
<script>
import API from '../../services/api.js'
import EventModal from './EventModal.vue'
import ResultsModal from './ResultsModal.vue'

export default {
  name: 'AdminMain',
  props: [],
  components: {
    EventModal,
    ResultsModal
  },
  data () {
    return {
      logged_in: false,
      password: '',
      events: [],
      fields: [
        {"key": "name", "sortable": true},
        {"key": "start_date", "sortable": true},
        {"key": "end_date", "sortable": true},
        {"key": "status", "sortable": true},
        {"key": "results", "sortable": false},
        {"key": "controls", "sortable": false}
      ],
      sortBy: 'end_time',
      sortDesc: true,
      full_events: [],
      existing: null,
      create_or_edit_button: 'Create',
      create_or_edit_title: 'Create Event',
      modal_delete_title: '',
      event_to_delete: '',
      preview_results_set: [],
      modal_results_title: ''
    }
  },
  mounted() {
    this.initialise()
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
    resetModalText() {
      this.create_or_edit_title = 'Create Event'
      this.create_or_edit_button = 'Create'
      this.existing = null
    },
    handleOk(bvModalEvt) {
      // Prevent modal from closing
      bvModalEvt.preventDefault()
      // Trigger submit handler

      if (this.create_or_edit_title == 'Create Event') {
        this.$refs.event_modal.createEvent().then(new_event => {
          this.events = []
          this.getEvents()
          // Hide the modal manually
          this.$nextTick(() => {
            this.$bvModal.hide('modal-1')
          })
        })
      } else if (this.create_or_edit_title == 'Edit Event') {
        this.$refs.event_modal.editEvent().then(new_event => {
          this.events = []
          this.getEvents()
          // Hide the modal manually
          this.$nextTick(() => {
            this.$bvModal.hide('modal-1')
          })
        })
      }
    },
    handleDelete(bvModalEvt) {
      // Prevent modal from closing
      bvModalEvt.preventDefault()
      // Trigger submit handler
      API.deleteEvent(this.event_to_delete).then(_ => {
        this.event_to_delete = ''
        this.events = []
        this.getEvents()

        // Hide the modal manually
        this.$nextTick(() => {
          this.$bvModal.hide('delete-modal')
        })
      })
      
    },
    addNewEvent(e) {
      let start = new Date(e.start_time).toDateString()
      let end = new Date(e.end_time).toDateString()
      let current_time = Date.now()
      let active_text = ''
      let end_display = end
      let name_display = e.event_name
      let start_display = start

      if (current_time < e.start_time) {
        active_text = '<span style="font-style: italic; font-weight: bold">Scheduled</span>'
      } else if (current_time >= e.start_time && current_time < e.end_time) {
        active_text = '<span style="color: green; font-weight: bold">Active</span>'
      } else if (current_time >= e.end_time) {
        active_text = '<span style="opacity: 0.5; font-weight: bold">Finished</span>'
        start_display = `<span style="opacity: 0.5">${start}</span>`
        end_display = `<span style="opacity: 0.5">${end}</span>`
        name_display = `<span style="opacity: 0.5">${e.event_name}</span>`
      } else {
        active_text = 'Error'
      }

      this.events.push({
        "name": name_display, 
        "start_date": start_display, 
        "end_date": end_display, 
        "end_time": e.end_time,
        "status": active_text,
        "results": '',
        "controls": "",
        "id": e._id,
      })
    },
    editEvent(e, idx) {
      let current_name = e.name
      let current_start_date = e.start_date.split(' ')
      let current_end_date = e.end_date.split(' ')

      let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      let month_idx_s = months.indexOf(current_start_date[1]) +1
      let month_idx_e = months.indexOf(current_end_date[1]) +1
      let re_format_s = current_start_date[3]+'-'+month_idx_s+'-'+current_start_date[2]
      let re_format_e = current_end_date[3]+'-'+month_idx_e+'-'+current_end_date[2]

      this.existing = {
        ev_name: current_name,
        ev_start_date: re_format_s,
        ev_end_date: re_format_e,
        ev_id: e.id
      }

      this.create_or_edit_title = 'Edit Event'
      this.create_or_edit_button = 'Save'

      this.$nextTick(() => {
        this.$bvModal.show('modal-1')
      })

    },
    deleteEvent(e, idx) {
      let current_name = e.name
     
      this.modal_delete_title = 'Delete Event: '+current_name
      this.event_to_delete = e.id

      this.$nextTick(() => {
        this.$bvModal.show('delete-modal')
      })

    },
    getEvents() {
        API.getAllEvents().then(response => {
            if (Object.keys(response).indexOf('err') > -1) {
                console.log(response.err)
            } else {
                this.full_events = response.data
                this.full_events.forEach((ev, idx) => {
                  this.addNewEvent(ev)
                })
            }
        })
    },
    previewResults(item) {
      API.eventResults(item.id).then(response => {
        if (Object.keys(response).indexOf('err') > -1) {
          console.log(response.err)
        } else {
          this.preview_results_set = response.data
          let name = item.name.charAt(0).toUpperCase() + item.name.slice(1);
          this.modal_results_title = `${name} Results Preview`

          this.$nextTick(() => {
            this.$bvModal.show('results-modal')
          })
        }
      })
    },
    downloadResults(item) {     
      API.eventResults(item.id).then(response => {
        if (Object.keys(response).indexOf('err') > -1) {
          console.log(response.err)
        } else {
          console.log(response.data)
          let headers = ['start_date', 'athlete_name', 'activity_name', 'distance_miles', 'moving_time_seconds', 'elapsed_time_seconds', 'elevation_gain_ft']
            
          // Download the results as csv
          let tmp_csv = [headers]
          response.data.forEach(r => {
            let activity_name = ''
            if (Object.keys(r).indexOf('activity_name') > -1) {
                activity_name = r['activity_name'].replace(/,/g,'-')
            }
            let start_date = ''
            if (Object.keys(r).indexOf('start_date') > -1) {
                start_date = r['start_date']
            }
            tmp_csv.push([start_date, r['athlete_name'], activity_name, r['distance'], r['moving_time'], r['elapsed_time'], r['elevation_gain']])
          })
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
          download(csvContent, item.name+'_results.csv', 'text/csv;encoding:utf-8');
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

  h1.hover-cursor, .ev-icon {
    cursor: pointer
  }

  .events-table {
    max-height: 600px;
  }

  .text-left {
    margin-bottom: 20px;
  }  

  .icon-container {
    display: inline-flex;
    /*align-items: stretch;*/
    justify-content: space-evenly;
    width: 100%;
    height: 100%;
  }

  .tooltip { top: 0; }

  .results-icons {
    display: inline-flex;
    width: 100%;
    justify-content: space-evenly;
  }

  /*div.modal.results-modal .modal-dialog {
    height: 80% !important;
  }*/

  

</style>

