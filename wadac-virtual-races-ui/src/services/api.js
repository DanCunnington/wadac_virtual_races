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
                { value: 1, text: '1 - NOT Caernarfon Castle to Penygroes', ref_distance: 9.1, ref_elevation_gain: 447},
                { value: 2, text: '2 - NOT Penygroes to Criccieth Castle', ref_distance: 10.7, ref_elevation_gain: 370},
                { value: 3, text: '3 - NOT Criccieth Castle to Maentwrog', ref_distance: 12.3, ref_elevation_gain: 938},
                { value: 4, text: '4 - NOT Maentwrog to Harlech Castle', ref_distance: 9.5, ref_elevation_gain: 482},
                { value: 5, text: '5 - NOT Harlech Castle to Barmouth', ref_distance: 9.6, ref_elevation_gain: 461},
                { value: 6, text: '6 - NOT Barmouth to Dolgellau', ref_distance: 10.7, ref_elevation_gain: 694},
                { value: 7, text: '7 - NOT Dolgellau to Dinas Mawddwy', ref_distance: 10.1, ref_elevation_gain: 1473},
                { value: 8, text: '8 - NOT Dinas Mawddwy to Foel', ref_distance: 10.8, ref_elevation_gain: 1018},
                { value: 9, text: '9 - NOT Foel to  Llanfair Caereinion', ref_distance: 8.5, ref_elevation_gain: 325},
                { value: 10, text: '10 - NOT Llanfair Caereinion to Newtown', ref_distance: 13.1, ref_elevation_gain: 1111}
              ]
            },
            { label: 'Day 2',
              options: [
                { value: 11, text: '11 - NOT Newtown to Llanbadarn Fynydd', ref_distance: 10.8, ref_elevation_gain: 1239},
                { value: 12, text: '12 - NOT Llanbadarn Fynydd to Crossgates', ref_distance: 11.2, ref_elevation_gain: 503},
                { value: 13, text: '13 - NOT Crossgates to Builth Wells', ref_distance: 10.6, ref_elevation_gain: 523},
                { value: 14, text: '14 - NOT Builth Wells to Drovers Arms', ref_distance: 10.8, ref_elevation_gain: 1619},
                { value: 15, text: '15 - NOT Epynt Visitor Centre to Brecon', ref_distance: 12.8, ref_elevation_gain: 496},
                { value: 16, text: '16 - NOT Brecon to Torpantau', ref_distance: 12.5, ref_elevation_gain: 1179},
                { value: 17, text: '17 - NOT Taf Fechan Railway Station to Cyfarthfa Castle', ref_distance: 8.7, ref_elevation_gain: 407},
                { value: 18, text: '18 - NOT Merthyr Tydfil to Abercynon', ref_distance: 9.1, ref_elevation_gain: 404},
                { value: 19, text: '19 - NOT Abercynon to Nantgarw', ref_distance: 7.7, ref_elevation_gain: 278},
                { value: 20, text: '20 - NOT Caerphilly Castle to Cardiff Castle', ref_distance: 9.9, ref_elevation_gain: 205}
              ]
            }
        ]
    },
    calculateAdjustedWCRTime(stage, recorded_distance, recorded_time, recorded_elevation_gain) {
        let stageInfo = this.getWCRStages()
        let dayOne = stageInfo[1].options
        let dayTwo = stageInfo[2].options

        let ref_distance = null
        let ref_elevation_gain = null
        if (stage <= 10) {
            dayOne.forEach(s => {
                if (s.value == stage) {
                    ref_distance = s.ref_distance
                    ref_elevation_gain = s.ref_elevation_gain
                }
            })
        } else {
            dayTwo.forEach(s => {
                if (s.value == stage) {
                    ref_distance = s.ref_distance
                    ref_elevation_gain = s.ref_elevation_gain
                }
            })
        }
        if (!ref_distance || !ref_elevation_gain) {
            return false
        } else {
            let dist_factor = recorded_distance / ref_distance
            let adj_distance = recorded_time / dist_factor
            let adj_elev = Math.pow((ref_elevation_gain / (recorded_elevation_gain / dist_factor)),0.05)
            let adj_time = parseInt(adj_distance * adj_elev)

            return {adj_time, ref_distance, ref_elevation_gain}
        }
    }
}