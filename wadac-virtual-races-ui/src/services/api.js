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

    submitResult(result, access_token) {
        let obj = {result, access_token}
        return new Promise((resolve, reject) => {
            Vue.prototype.$http.post(server_url+'/submit_result', obj).then(response => {
                return resolve(response)
            }, err => {
                // If access token is invalid, deauthorise
                console.log(err)
                this.clearCookie()
            })  
        })
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
    missingElevationResults() {
        return Vue.prototype.$http.get(server_url+'/missing_elevation_results')
    },
    updateResultElevation(result_id, elevation_gain, elevation_change) {
        return Vue.prototype.$http.post(server_url+'/edit_result_elevation', {result_id, elevation_gain, elevation_change})
    },

    getWCRTeams() {
        return [
            { value: null, text: 'Please select a team', disabled: true }, 
            { value: 'lc1', text: 'Les Croupiers Team 1', short: 'LECR 1'},
            { value: 'lc2', text: 'Les Croupiers Team 2', short: 'LECR 2'},
            { value: 'lc3', text: 'Les Croupiers Team 3', short: 'LECR 3'},
            { value: 'lc4', text: 'Les Croupiers Team 4', short: 'LECR 4'},
            { value: 'li1', text: 'Lliswerry Team 1', short: 'LISW 1'}, 
            { value: 'li2', text: 'Lliswerry Team 2', short: 'LISW 2'}, 
            { value: 'li3', text: 'Lliswerry Team 3', short: 'LISW 3'}, 
            { value: 'li4', text: 'Lliswerry Team 4', short: 'LISW 4'}, 
            { value: 'wi1', text: 'Winchester Team 1', short: 'WADAC 1'},
            { value: 'wi2', text: 'Winchester Team 2', short: 'WADAC 2'},
            { value: 'wi3', text: 'Winchester Team 3', short: 'WADAC 3'},
            { value: 'wi4', text: 'Winchester Team 4', short: 'WADAC 4'},
            { value: 'wi5', text: 'Winchester Team 5', short: 'WADAC 5'}
          ]
    },

    getWCRStages() {
        return [
            { value: null, text: 'Please select a stage', disabled: true },
            { label: 'Day 1',
              options: [
                { value: 1, text: '1 - NOT Caernarfon Castle to Penygroes', ref_distance: 9.1, ref_elevation_gain: 446, ref_elevation_change: 309},
                { value: 2, text: '2 - NOT Penygroes to Criccieth Castle', ref_distance: 10.7, ref_elevation_gain: 371, ref_elevation_change: -255},
                { value: 3, text: '3 - NOT Criccieth Castle to Maentwrog', ref_distance: 12.3, ref_elevation_gain: 938, ref_elevation_change: -19},
                { value: 4, text: '4 - NOT Maentwrog to Harlech Castle', ref_distance: 9.5, ref_elevation_gain: 482, ref_elevation_change: -42},
                { value: 5, text: '5 - NOT Harlech Castle to Barmouth', ref_distance: 9.6, ref_elevation_gain: 462, ref_elevation_change: -60},
                { value: 6, text: '6 - NOT Barmouth to Dolgellau', ref_distance: 10.7, ref_elevation_gain: 696, ref_elevation_change: 19},
                { value: 7, text: '7 - NOT Dolgellau to Dinas Mawddwy', ref_distance: 10.1, ref_elevation_gain: 1473, ref_elevation_change: 274},
                { value: 8, text: '8 - NOT Dinas Mawddwy to Foel', ref_distance: 10.8, ref_elevation_gain: 1017, ref_elevation_change: 282},
                { value: 9, text: '9 - NOT Foel to  Llanfair Caereinion', ref_distance: 8.5, ref_elevation_gain: 325, ref_elevation_change: -173},
                { value: 10, text: '10 - NOT Llanfair Caereinion to Newtown', ref_distance: 13.1, ref_elevation_gain: 1112, ref_elevation_change: -97}
              ]
            },
            { label: 'Day 2',
              options: [
                { value: 11, text: '11 - NOT Newtown to Llanbadarn Fynydd', ref_distance: 10.8, ref_elevation_gain: 1240, ref_elevation_change: 583},
                { value: 12, text: '12 - NOT Llanbadarn Fynydd to Crossgates', ref_distance: 11.2, ref_elevation_gain: 502, ref_elevation_change: 333},
                { value: 13, text: '13 - NOT Crossgates to Builth Wells', ref_distance: 10.6, ref_elevation_gain: 522, ref_elevation_change: 258},
                { value: 14, text: '14 - NOT Builth Wells to Drovers Arms', ref_distance: 10.8, ref_elevation_gain: 1621, ref_elevation_change: 1012},
                { value: 15, text: '15 - NOT Epynt Visitor Centre to Brecon', ref_distance: 12.8, ref_elevation_gain: 495, ref_elevation_change: -685},
                { value: 16, text: '16 - NOT Brecon to Torpantau', ref_distance: 12.5, ref_elevation_gain: 1181, ref_elevation_change: 981},
                { value: 17, text: '17 - NOT Taf Fechan Railway Station to Cyfarthfa Castle', ref_distance: 8.7, ref_elevation_gain: 407, ref_elevation_change: -509},
                { value: 18, text: '18 - NOT Merthyr Tydfil to Abercynon', ref_distance: 9.1, ref_elevation_gain: 404, ref_elevation_change: -255},
                { value: 19, text: '19 - NOT Abercynon to Nantgarw', ref_distance: 7.7, ref_elevation_gain: 280, ref_elevation_change: 37},
                { value: 20, text: '20 - NOT Caerphilly Castle to Cardiff Castle', ref_distance: 9.9, ref_elevation_gain: 207, ref_elevation_change: -288}
              ]
            }
        ]
    },
    calculateAdjustedTimeOLD(ref_distance, ref_elevation_gain, recorded_distance, recorded_time, 
        recorded_elevation_gain) {
        let dist_factor = recorded_distance / ref_distance
        let adj_distance = recorded_time / dist_factor
        let adj_elev = Math.pow((ref_elevation_gain / (recorded_elevation_gain / dist_factor)),0.05)
        let adj_time = parseInt(adj_distance * adj_elev)
        let h = parseInt(adj_time / 3600).toString()
        let m = parseInt((adj_time % 3600)/60).toString()
        let s = parseInt((adj_time % 3600)%60).toString()
        if (h.length == 1) {
            h = '0'+h
        }
        if (m.length == 1) {
            m = '0'+m
        }
        if (s.length == 1) {
            s = '0'+s
        }
        let hms_str = h+':'+m+':'+s
        return {adj_time, ref_distance, ref_elevation_gain, hms_str}
    },
    calculateAdjustedTime(ref_distance, ref_elevation_gain, ref_elevation_change, recorded_distance, recorded_time, 
        recorded_elevation_gain, recorded_elev_change) {
        let dist_factor = recorded_distance / ref_distance
        let adj_distance = recorded_time / dist_factor
        let average_pace = recorded_time / recorded_distance
        let total_climb = recorded_elevation_gain + recorded_elev_change
        let scaled_climb = total_climb / dist_factor
        let excess_elev_change = scaled_climb - (ref_elevation_change + ref_elevation_gain)
        let elev_change_per_mile = (7 / 100) * (excess_elev_change / recorded_distance)
        let new_avg_pace = average_pace * (1 - (elev_change_per_mile / 100))

        let adj_time = parseInt(new_avg_pace * ref_distance)

        let h = parseInt(adj_time / 3600).toString()
        let m = parseInt((adj_time % 3600)/60).toString()
        let s = parseInt((adj_time % 3600)%60).toString()
        if (h.length == 1) {
            h = '0'+h
        }
        if (m.length == 1) {
            m = '0'+m
        }
        if (s.length == 1) {
            s = '0'+s
        }
        let hms_str = h+':'+m+':'+s
        return {adj_time, ref_distance, ref_elevation_gain, ref_elevation_change, hms_str}
    },
    calculateAdjustedWCRTime(stage, recorded_distance, recorded_time, recorded_elevation_gain, recorded_elev_change) {
        let stageInfo = this.getWCRStages()
        let dayOne = stageInfo[1].options
        let dayTwo = stageInfo[2].options

        let ref_distance = null
        let ref_elevation_gain = null
        let ref_change = null
        if (stage <= 10) {
            dayOne.forEach(s => {
                if (s.value == stage) {
                    ref_distance = s.ref_distance
                    ref_elevation_gain = s.ref_elevation_gain
                    ref_change = s.ref_elevation_change
                }
            })
        } else {
            dayTwo.forEach(s => {
                if (s.value == stage) {
                    ref_distance = s.ref_distance
                    ref_elevation_gain = s.ref_elevation_gain
                    ref_change = s.ref_elevation_change
                }
            })
        }
        if (!ref_distance || !ref_elevation_gain) {
            return false
        } else {
            return this.calculateAdjustedTime(ref_distance, ref_elevation_gain, ref_change, recorded_distance, 
                recorded_time, recorded_elevation_gain, recorded_elev_change)
        }
    }
}