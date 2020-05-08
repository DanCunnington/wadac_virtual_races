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
        return new Promise((resolve, reject) => {
            Vue.prototype.$http.get(server_url+'/refresh_access_token?refresh_token='+refresh_token).then(response => {
                return resolve(response)
            }, err => {
                console.log('refresh token invalid, time to deauth')
                reject()
            })
        })
        
    },

    getAccessToken(code) {
        return new Promise((resolve, reject) => {
            // If access token is invalid, deauthorise
            Vue.prototype.$http.get(server_url+'/get_access_token?code='+code).then(response => {
                return resolve(response)
            }, err => {
                console.log(err)
                reject()
            })
        })
    },

    getActiveEvents() {
        return Vue.prototype.$http.get(server_url+'/active_events')
    },

    getAllEvents() {
        return Vue.prototype.$http.get(server_url+'/all_events')
    },

    getAthleteActivities(access_token) {
        return new Promise((resolve, reject) => {
            Vue.prototype.$http.get(server_url+'/athlete_activities?access_token='+access_token).then(response => {
                return resolve(response)
            }, err => {
                // If access token is invalid, deauthorise
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

    getWCRTeams() {
        return [
            { value: null, text: 'Please select a team', disabled: true }, 
            { value: 'Lliswerry Runners', text: 'Lliswerry Runners'}, 
            { value: 'Winchester & District AC', text: 'Winchester & District AC'}
          ]
    },

    getWCRStages() {
        return [
            { value: null, text: 'Please select a stage', disabled: true },
            { label: 'Day 1',
              options: [
                { value: 1, text: '1 - NOT Caernarfon Castle to Penygroes'},
                { value: 2, text: '2 - NOT Penygroes to Criccieth Castle'},
                { value: 3, text: '3 - NOT Criccieth Castle to Maentwrog'},
                { value: 4, text: '4 - NOT Maentwrog to Harlech Castle'},
                { value: 5, text: '5 - NOT Harlech Castle to Barmouth'},
                { value: 6, text: '6 - NOT Barmouth to Dolgellau'},
                { value: 7, text: '7 - NOT Dolgellau to Dinas Mawddwy'},
                { value: 8, text: '8 - NOT Dinas Mawddwy to Foel'},
                { value: 9, text: '9 - NOT Foel to  Llanfair Caereinion'},
                { value: 10, text: '10 - NOT Llanfair Caereinion to Newtown'}
              ]
            },
            { label: 'Day 2',
              options: [
                { value: 11, text: '11 - NOT Newtown to Llanbadarn Fynydd'},
                { value: 12, text: '12 - NOT Llanbadarn Fynydd to Crossgates'},
                { value: 13, text: '13 - NOT Crossgates to Builth Wells'},
                { value: 14, text: '14 - NOT Builth Wells to Drovers Arms'},
                { value: 15, text: '15 - NOT Epynt Visitor Centre to Brecon'},
                { value: 16, text: '16 - NOT Brecon to Torpantau'},
                { value: 17, text: '17 - NOT Taf Fechan Railway Station to Cyfarthfa Castle'},
                { value: 18, text: '18 - NOT Merthyr Tydfil to Abercynon'},
                { value: 19, text: '19 - NOT Abercynon to Nantgarw'},
                { value: 20, text: '20 - NOT Caerphilly Castle to Cardiff Castle'}
              ]
            }
        ]
    }
}