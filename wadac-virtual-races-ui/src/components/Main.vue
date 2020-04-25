<template>
  <div class="hello">
    <h1>WADAC Virtual Racing</h1>
    <p v-if="!cookie.access_token">Hi there. Please log in to Strava using the button below. You must grant "read" permissions for this app to work.</p>
    <img v-if="!cookie.access_token" class="strava" height="48px" src="../assets/btn_strava_connectwith_orange@2x.png" @click="directToStrava()"/>
    <div v-if="cookie.access_token">
      <p>Hi, {{cookie.user_name}}!</p>

      <div class="content">
        <SubmitResult :cookie="cookie" :server_url="server_url"></SubmitResult>
      </div>
    </div>
  </div>
</template>

<script>
import SubmitResult from './SubmitResult.vue'

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
      server_url: null,
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
        this.server_url = 'http://localhost:3000'
      } else if (process.env.NODE_ENV == 'production') {
        this.callback_url = 'https://wadac-virtual-races.eu-gb.mybluemix.net'
        this.server_url = 'https://wadac-virtual-races.eu-gb.mybluemix.net'
      }

      // Get client ID
      this.$http.get(this.server_url+'/get_client_id').then(response => {
        this.strava_client_id = response.data.client_id
        
        // Check if access token cookie exists
        let cookie = JSON.parse(this.$cookie.get('wadac_virtual_races'));
        if (cookie && cookie != "undefined") {
          if (!this.cookieExpired(cookie)) {
            this.cookie = cookie
            console.log('exists')
          } else {
            this.refreshAccessToken(cookie).then(_ => {
              console.log('refreshed')
            })
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
      this.$router.push('/')
    },
    directToStrava() {
      let url = `https://www.strava.com/oauth/authorize?client_id=${this.strava_client_id}&redirect_uri=${this.callback_url}&response_type=code&scope=activity:read`
      window.location.href=url
    },
    refreshAccessToken(c) {
      return new Promise((resolve, reject) => {
        let refresh_token = c.refresh_token
        let user_name = c.user_name
        this.$http
        .get(this.server_url+'/refresh_access_token?refresh_token='+refresh_token)
        .then(response => {
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
            resolve()
          }
        })
      })
    },
    getAccessToken(code) {
      this.$http
      .get(this.server_url+'/get_access_token?code='+code)
      .then(response => {
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

</style>
