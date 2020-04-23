<template>
  <div class="hello">
    <h1>WADAC Virtual Racing Results Collector</h1>
    <p v-if="!cookie.access_token">Hi there. Please log in to Strava using the button below. You must grant "read" permissions for this app to work.</p>
    <img v-if="!cookie.access_token" class="strava" height="48px" src="../assets/btn_strava_connectwith_orange@2x.png" @click="directToStrava()"/>
    <p v-if="cookie.access_token">Hi, {{cookie.user_name}}!</p>
    <b-form inline @submit.prevent="getResults" v-if="cookie.access_token" class="justify-content-center">
      <b-form-group
        id="input-group-1"
        label="Strava Activity Name: "
        class="mr-sm-2"
        label-for="input-1"
      >
        <b-form-input
          id="input-1"
          v-model="event_name"
          size="sm"
          type="text"
          required
        ></b-form-input>
      </b-form-group>
      <b-button type="submit" variant="primary" :disabled="isSubmitted">Get Results</b-button>
    </b-form>

    
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {

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
            console.log(cookie.refresh_token)
            this.refreshAccessToken(cookie).then(_ => {
              console.log('refreshed')
            })
          }
        } else {
          // For callback, get access token
          let query_params = this.$route.query
          if (query_params && Object.keys(query_params).indexOf('code') > -1) {
            let code = query_params.code
            this.getAccessToken(code)
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
    directToStrava() {
      let url = `https://www.strava.com/oauth/authorize?client_id=${this.strava_client_id}&redirect_uri=${this.callback_url}&response_type=code`
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
    },
    getResultsRequest() {
      this.$http
      .get(this.server_url+'/get_results?access_token='+this.cookie.access_token+'&event_name='+this.event_name)
      .then(response => {
        if (Object.keys(response).indexOf('err') > -1) {
          console.log(response.err)
        } else {
          console.log(response.data)
          this.results = response.data.results
          let headers = response.data.headers

          // Download the results as csv
          let tmp_csv = [headers]
          this.results.forEach(r => {
            tmp_csv.push([r['athlete_name'], r['activity_name'], r['distance_miles'], r['moving_time'], r['elev_gain']])
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
          download(csvContent, this.event_name+'.csv', 'text/csv;encoding:utf-8');
          this.isSubmitted = false
        }
      })
    },
    getResults() {
      this.isSubmitted = true
      this.results = []

      // Check cookie is ok
      if (this.cookieExpired(this.cookie)) {
        this.refreshAccessToken(this.cookie).then(_ => {
          this.getResultsRequest()
        })
      } else {
        this.getResultsRequest()
      } 
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

</style>
