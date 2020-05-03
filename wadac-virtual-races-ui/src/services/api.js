import Vue from 'vue'
import Router from '../router'; 

// Dev or Prod
let server_url = 'http://localhost:3000'
if (process.env.NODE_ENV == 'production') {
	server_url = 'https://wadac-virtual-races.eu-gb.mybluemix.net'
} 
	
export default {
	clearCookie() {
		Vue.prototype.$cookie.delete('wadac_virtual_races');
		Router.go()
	},
	getClientID() {
		return Vue.prototype.$http.get(server_url+'/get_client_id')
	},

	refreshAccessToken(refresh_token) {
		return Vue.prototype.$http.get(server_url+'/refresh_access_token?refresh_token='+refresh_token)
	},

	getAccessToken(code) {
		return new Promise((resolve, reject) => {
			// If access token is invalid, deauthorise
			Vue.prototype.$http.get(server_url+'/get_access_token?code='+code).then(response => {
				return resolve(response)
			}, err => {
				console.log(err)
				this.clearCookie()
			})
		})
	},

	signout(access_token) {
		return Vue.prototype.$http.get(server_url+'/signout?access_token='+access_token)
	},

	getActiveEvents() {
		return Vue.prototype.$http.get(server_url+'/active_events')
	},

	getAllEvents() {
		return Vue.prototype.$http.get(server_url+'/all_events')
	},

	getAthleteActivities(access_token) {
		return new Promise((resolve, reject) => {
			// If access token is invalid, deauthorise
			Vue.prototype.$http.get(server_url+'/athlete_activities?access_token='+access_token).then(response => {
				return resolve(response)
			}, err => {
				console.log(err)
				this.clearCookie()
			})	
		})
	},

	submitResult(result) {
		return Vue.prototype.$http.post(server_url+'/submit_result', result)
	},

	isAdmin(password) {
		return Vue.prototype.$http.post(server_url+'/is_admin', password)
	},

	newEvent(evt) {
		return Vue.prototype.$http.post(server_url+'/new_event', evt)
	},

	editEvent(evt_id, evt) {
		evt._id = evt_id
		return Vue.prototype.$http.post(server_url+'/edit_event', evt)
	},

	deleteEvent(evt_id) {
		return Vue.prototype.$http.post(server_url+'/delete_event', {"_id": evt_id})
	},

	eventResults(evt_id) {
		return Vue.prototype.$http.get(server_url+'/event_results?event_id='+evt_id)
	},
}