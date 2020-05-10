<template>
  <div class="hello">
    <h1>WADAC Virtual Racing</h1>
    <div class="content">
      <div v-if="!refreshing">
        <p class="welcome" v-if="!cookie.access_token && !manual_submission_submitted && !loading">Hi there. Welcome to the WADAC virtual racing results submission tool. Please choose one of the following options:</p>

        <div v-if="!manual_submission_submitted && !loading" class="submission-container">
          <div class="strava-option">
            <h4 class="welcome-heading" v-if="!cookie.access_token && !loading">1) Strava (Easiest)</h4>
            <p class="submit-instructions" v-if="!cookie.access_token && !loading">If you have a Strava account, select from one of your activities using the button below.</p> 

            <p class="submit-instructions strava" v-if="!cookie.access_token && !loading">Note: This application requires access to your activities but will only store the activity name, distance, elapsed time, moving time and elevation gain.</p>
            <img v-if="!cookie.access_token && !loading" class="strava" height="48px" src="../assets/btn_strava_connectwith_orange@2x.png" @click="directToStrava()"/>
            <p v-if="loading">Loading...</p>
            <div v-if="cookie.access_token && !loading">
              <p class="name">Hi, {{cookie.user_name}}!</p>
              <p class="signout" @click="deauthorise()">Sign out?</p>

              <SubmitResult :cookie="cookie"></SubmitResult>
            </div>
          </div>

          <div class="manual-option" v-if="!cookie.access_token && !loading">
            <b-modal id="manual-upload-modal" :ok-title="'Submit'" :title="'Manual Result Submission'" @ok="handleManualResultOk">
              <ManualResultModal ref="mr_modal_main" :events_type="'active'"></ManualResultModal>
            </b-modal>

            <h4 class="welcome-heading">2) Manual Submission</h4>
            <p class="submit-instructions">Alternatively, if you don't have a Strava account, you can submit your result manually by clicking <span class="manual-upload" @click="manualUpload">here</span>.</p> 
          </div>
        </div>
        <div v-else>
          <p v-if="!loading" class="manual-ok">Thank you, your manual result submission has been saved.</p>
        </div>
      </div>
      <div v-else>
        Loading...
      </div>
    </div>
  </div>
</template>

<script>
import SubmitResult from './SubmitResult.vue'
import ManualResultModal from './admin/ManualResultModal.vue'
import API from '../services/api.js'

export default {
  name: 'Main',
  props: {

  },
  components: {
    SubmitResult,
    ManualResultModal
  },
  data () {
    return {
      strava_client_id: null,
      callback_url: null,
      cookie: {
        access_token: false
      },
      event_name: '',
      manual_submission_submitted: false,
      results: [],
      loading: false,
      refreshing: true,
      state: 'loading'
    }
  },
  mounted() {
    this.initialise()
  },
  methods: {
    initialise() {
      // Dev or Prod
      if (process.env.NODE_ENV == 'development') {
        this.callback_url = 'http://localhost:8080'
      } else if (process.env.NODE_ENV == 'production') {
        this.callback_url = 'https://wadac-virtual-races.eu-gb.mybluemix.net'
      }

      // Get client ID
      API.getClientID().then(response => {
        this.strava_client_id = response.data.client_id
        
        // Check if access token cookie exists
        let cookie = JSON.parse(this.$cookie.get('wadac_virtual_races'));
        if (cookie && cookie != "undefined") {
          if (!this.cookieExpired(cookie)) {
            this.cookie = cookie
            this.loading = false
            this.refreshing = false
            console.log('exists')
          } else {
            this.refreshAccessToken(cookie)
          }
        } else {
          this.refreshing = false
          // For callback, get access token
          let query_params = this.$route.query
          if (query_params && Object.keys(query_params).indexOf('code') > -1 &&
            Object.keys(query_params).indexOf('scope') > -1) {
            this.loading = true
            let code = query_params.code
            let scope = query_params.scope
            if (!scope.includes('activity:read')) {
              this.deauthorise()
            } else {
              this.getAccessToken(code)
            }
          }
        }
      })
    },
    cookieExpired(c) {
      let time_now = Date.now()
      if (c && c.expires_at) {
        return time_now > c.expires_at*1000
      } else {
        return true
      }
    },
    deauthorise() {
      this.cookie = {access_token: false}
      this.$cookie.delete('wadac_virtual_races');
      // Route to homepage
      let query_params = this.$route.query
      this.loading = false
      this.refreshing = false
      if (query_params && Object.keys(query_params).indexOf('code') > -1 && 
        Object.keys(query_params).indexOf('scope') > -1) {
        this.$router.push('/') 
      } else {
        this.$router.go()
      }
    },
    directToStrava() {
      let url = `https://www.strava.com/oauth/authorize?client_id=${this.strava_client_id}&redirect_uri=${this.callback_url}&response_type=code&scope=activity:read`
      window.location.href=url
    },
    refreshAccessToken(c) {
      this.refreshing = true
      let refresh_token = c.refresh_token
      let user_name = c.user_name
      API.refreshAccessToken(refresh_token).then(response => {
        if (Object.keys(response).indexOf('err') > -1) {
          console.log(response.err)
          reject()
        } else {
          let new_cookie = {
            "access_token": response.data.access_token,
            "refresh_token": response.data.refresh_token,
            "user_name": user_name,
            "expires_at": response.data.expires_at
          }
          this.$cookie.set('wadac_virtual_races', JSON.stringify(new_cookie), 30)
          this.cookie = new_cookie
          this.loading = false
          console.log('refreshed')
          setTimeout(_ => {
            this.refreshing = false
          }, 1000)
        }
      }, err => {
        this.deauthorise()
      })
    },
    getAccessToken(code) {
      API.getAccessToken(code).then(response => {
        if (Object.keys(response).indexOf('err') > -1) {
          console.log(response.err)
        } else {
          let cookie = {
            "access_token": response.data.access_token,
            "refresh_token": response.data.refresh_token,
            "user_name": response.data.user_name,
            "expires_at": response.data.expires_at
          }
          this.$cookie.set('wadac_virtual_races', JSON.stringify(cookie), 30)
          this.cookie = cookie
          this.loading = false
          this.$router.push('/') 
        }
      }, err => {
        this.deauthorise()
      })
    },
    manualUpload() {
      this.$nextTick(() => {
        this.$bvModal.show('manual-upload-modal')
      })
    },
    handleManualResultOk(bvModalEvt) {
      bvModalEvt.preventDefault()
      this.$refs.mr_modal_main.submitManualResult().then(_ => {
        this.manual_submission_submitted = true
        // Hide the modal manually
        this.$nextTick(() => {
          this.$bvModal.hide('manual-upload-modal')
        })
      })
      .catch(err => {
        console.log('problem')
        console.log(err)
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hello {
  padding-bottom: 30px;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
img.strava:hover {
  cursor: pointer;
}
input {
  margin-left: 10px;
}
button:disabled {
  cursor: not-allowed;
  pointer-events: all !important;
}

.content {
  margin-top: 40px;
  margin: 0 auto;
  max-width: 520px;
}

h1.hover-cursor {
  cursor: pointer
}

p.name {
  margin: 0;
}

p.signout, span.manual-upload {
  text-decoration: underline;
}

p.signout:hover, span.manual-upload:hover {
  cursor: pointer
}

h4.welcome-heading {
  text-align: left;
}

p.welcome {
  font-size: large;
  margin-bottom: 30px;
}

p.strava {
  font-style: italic;
  font-size: smaller;
  margin-bottom: 16px !important;
}

p.submit-instructions {
  margin-bottom: 5px;
  text-align: left;
}

.strava-option {
  margin-bottom: 40px;
}

span.manual-upload {
  color: blue !important;
}

p.manual-ok {
  text-align: center;
}


</style>
