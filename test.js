// require('dotenv').config()
// const strava = require('strava-v3')
// const fs = require('fs')
// args = process.argv.slice(2)

// if (args.length != 1) {
//  console.log('Please pass event name')
//  process.exit(0)
// }

// event_name = args[0]


// strava.config({
//   "client_id"     : process.env.CLIENT_ID,
//   "client_secret" : process.env.CLIENT_SECRET,
//   "redirect_uri"  : "https://localhost:3000",
// });



// access_token = ''

// //Get all activities for club
// strava.clubs.listActivities({"access_token": access_token, "id": process.env.CLUB_ID, "per_page": 200, "page": 1}, (err, result) => {
//  if (err) {
//      console.log(err)
//      process.exit(0)
//  }
//  // event_activities = []
//  // const writeStream = fs.createWriteStream(event_name+'.csv');
//  // let header = 'athlete,activity,distance (miles), moving time (seconds), elevation gain (ft)'
//  // writeStream.write(header+ '\n')
//  // result.forEach(activity => {
//  //  if (activity.name.includes(event_name)) {
//  //      athlete_name = activity.athlete.firstname +' '+activity.athlete.lastname
//  //      activity_name = activity.name
//  //      distance_miles = activity.distance / 1609
//  //      moving_time = activity.moving_time
//  //      elev_gain = activity.total_elevation_gain*3.281
//  //      csv_row = athlete_name+','+activity_name+','+distance_miles+','+moving_time+','+elev_gain
//  //      writeStream.write(csv_row +'\n')
//  //      event_activities.push([athlete_name, activity_name, distance_miles, moving_time, elev_gain])
//  //  }
//  // })
//  console.log(result)
//  console.log(result.length)

// })


//let event_id = new_result.event_id
// let athlete_name = new_result.athlete_name
// let activity_name = new_result.activity_name
// let activity_id = new_result.activity_id
// let elapsed_time = new_result.elapsed_time
// let start_date = new_result.start_date
// let moving_time = new_result.moving_time
// let elevation_gain = new_result.elevation_gain
// let distance = new_result.distance
// let manual_elevation_change = new_result.manual_elevation_change

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const request = require('request')
// insert lots of welsh castles data
let event_id = "5ed3b8398a85403060d96eec"

// teams
let teams = [
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

// For each stage
for (var stage=1; stage<21; stage++) {
    // For each team
    teams.forEach(t => {
        // Submit a result
        let new_result = {
            "result": {
                "wcr": true,
                "wcr_team": t['value'],
                "wcr_stage": stage,
                "event_id": event_id,
                "start_date": Date.now(),
                "athlete_name": t['short']+'_'+stage,
                "activity_name": t['short']+'_'+stage+'acnmae',
                "activity_id": t['short']+'_'+stage+'manual',
                "elapsed_time": randomIntFromInterval(2500,2567),
                "moving_time": randomIntFromInterval(2500,2567),
                "elevation_gain": randomIntFromInterval(200,500),
                "distance": randomIntFromInterval(5,15),
                "manual_elevation_change": randomIntFromInterval(23,50)
            },
            "access_token": null
        }

        request({
            url: "http://localhost:3000/submit_result",
            method: "POST",
            json: true,   // <--Very important!!!
            body: new_result
        }, function (error, response, body){
        });
        
    })
}


