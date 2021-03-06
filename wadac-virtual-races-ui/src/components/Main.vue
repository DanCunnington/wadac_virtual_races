<template>
  <div class="hello">
    <h1>WADAC Virtual Racing</h1>
    <p v-if="!cookie.access_token">Hi there. Please log in to Strava using the button below. This application requires access to your activities in order to submit a result.</p>
    <img v-if="!cookie.access_token" class="strava" height="48px" src="../assets/btn_strava_connectwith_orange@2x.png" @click="directToStrava()"/>
    <div v-if="cookie.access_token">
      <p class="name">Hi, {{cookie.user_name}}!</p>
      <p class="signout" @click="deauthorise()">Sign out?</p>

      <div class="content">
        <SubmitResult :cookie="cookie"></SubmitResult>
      </div>
    </div>
  </div>
</template>

<script>
import SubmitResult from './SubmitResult.vue'
import API from '../services/api.js'

export default {
  name: 'Main',
  props: {

  },
  components: {
    SubmitResult
  },
  data () {
    return {
      strava_client_id: null,
      callback_url: null,
      cookie: {
        access_token: false
      },
      event_name: '',
      isSubmitted: false,
      results: []
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
            console.log('exists')
          } else {
            this.refreshAccessToken(cookie)
          }
        } else {
          // For callback, get access token
          let query_params = this.$route.query
          if (query_params && Object.keys(query_params).indexOf('code') > -1 &&
            Object.keys(query_params).indexOf('scope') > -1) {
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
          console.log('refreshed')
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
          this.$router.push('/') 
        }
      }, err => {
        this.deauthorise()
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
  max-width: 500px;
}

h1.hover-cursor {
  cursor: pointer
}

p.name {
  margin: 0;
}

p.signout {
  text-decoration: underline;
}

p.signout:hover {
  cursor: pointer
}

</style>
