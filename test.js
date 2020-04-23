require('dotenv').config()
const strava = require('strava-v3')
const fs = require('fs')
args = process.argv.slice(2)

if (args.length != 1) {
	console.log('Please pass event name')
	process.exit(0)
}

event_name = args[0]


strava.config({
  "client_id"     : process.env.CLIENT_ID,
  "client_secret" : process.env.CLIENT_SECRET,
  "redirect_uri"  : "https://localhost:3000",
});



access_token = ''

//Get all activities for club
strava.clubs.listActivities({"access_token": access_token, "id": process.env.CLUB_ID, "per_page": 200, "page": 1}, (err, result) => {
	if (err) {
		console.log(err)
		process.exit(0)
	}
	// event_activities = []
	// const writeStream = fs.createWriteStream(event_name+'.csv');
	// let header = 'athlete,activity,distance (miles), moving time (seconds), elevation gain (ft)'
	// writeStream.write(header+ '\n')
	// result.forEach(activity => {
	// 	if (activity.name.includes(event_name)) {
	// 		athlete_name = activity.athlete.firstname +' '+activity.athlete.lastname
	// 		activity_name = activity.name
	// 		distance_miles = activity.distance / 1609
	// 		moving_time = activity.moving_time
	// 		elev_gain = activity.total_elevation_gain*3.281
	// 		csv_row = athlete_name+','+activity_name+','+distance_miles+','+moving_time+','+elev_gain
	// 		writeStream.write(csv_row +'\n')
	// 		event_activities.push([athlete_name, activity_name, distance_miles, moving_time, elev_gain])
	// 	}
	// })
	console.log(result)
	console.log(result.length)

})





