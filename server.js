require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const cors = require('cors')
const strava = require('strava-v3')
const path = require('path')
const cfenv = require("cfenv");


app.use(cors())

strava.config({
  "client_id"     : process.env.CLIENT_ID,
  "client_secret" : process.env.CLIENT_SECRET,
  "redirect_uri"  : "https://localhost:3000",
});

app.use('/', express.static(path.join(__dirname, 'ui')))

app.get('/get_client_id', (req, res) => {
	res.json({"client_id": process.env.CLIENT_ID})
})

app.get('/get_access_token', (req, res) => {
	strava.oauth.getToken(req.query.code, (err, result, body) => {
		if (err) {
			console.log(err)
			res.status(401)
			return res.json({"err": err})
		}
		access_token = body.access_token
		expires_at = body.expires_at
		refresh_token = body.refresh_token
		user_name = body.athlete.firstname + ' ' + body.athlete.lastname
		res.json({access_token, refresh_token, expires_at, user_name})
	})
})

app.get('/refresh_access_token', (req, res) => {
	let refresh_token = req.query.refresh_token
	strava.oauth.refreshToken(refresh_token).then((body) => {
		access_token = body.access_token
		expires_at = body.expires_at
		refresh_token = body.refresh_token
		res.json({access_token, refresh_token, expires_at})
	})
})

app.get('/get_results', (req, res) => {
	let access_token = req.query.access_token
	let event_name = req.query.event_name

	//Get all activities for club
	strava.clubs.listActivities({"access_token": access_token, "id": process.env.CLUB_ID, "per_page": 200}, (err, result) => {
		if (err) {
			console.log(err)
			res.status(500)
			return res.json({"err": err})
		}
		event_activities = []
		
		let headers = ['athlete','activity','distance (miles)', 'moving time (seconds)', 'elevation gain (ft)']
		result.forEach(activity => {
			if (activity.name.includes(event_name)) {
				athlete_name = activity.athlete.firstname +' '+activity.athlete.lastname
				activity_name = activity.name.split(',').join(' ')
				distance_miles = activity.distance / 1609
				moving_time = activity.moving_time
				elev_gain = activity.total_elevation_gain*3.281

				event_activities.push({
					athlete_name, activity_name, distance_miles, moving_time, elev_gain
				})
			}
		})
		res.json({"headers": headers, "results": event_activities})
	})
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))