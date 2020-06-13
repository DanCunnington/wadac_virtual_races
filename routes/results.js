const ObjectID = require('mongodb').ObjectID;
module.exports = (app, db, strava) => {

	// Add a new result for an event
	app.post('/submit_result', (req, res) => {
		let new_result = req.body.result
		let access_token = req.body.access_token
		let event_id = new_result.event_id
		let athlete_name = new_result.athlete_name
		let athlete_email = new_result.athlete_email
		let activity_name = new_result.activity_name
		let activity_type = new_result.activity_type
		let activity_id = new_result.activity_id
		let elapsed_time = new_result.elapsed_time
		let start_date = new_result.start_date
		let moving_time = new_result.moving_time
		let elevation_gain = new_result.elevation_gain
		let distance = new_result.distance
		let manual_elevation_change = new_result.manual_elevation_change

		// WCR
		let wcr = new_result.wcr
		let team = new_result.wcr_team
		let stage = new_result.wcr_stage

		if (!event_id || !activity_name || !activity_type || !athlete_email || !activity_id || !start_date || !athlete_name || 
			!elapsed_time || !moving_time || ! elevation_gain || !distance) {
			res.status(400)
			return res.json({"err": "please specify event_id, athlete_name, activity_type, athlete_email, activity_id, "+
				"activity_name, start_date, elapsed_time, moving_time, elevation_gain and distance"})
		}

		if (wcr && (!team || !stage)) {
			res.status(400)
			return res.json({"err": "for wcr please specify team and stage"})
		}

		let missing_net_elevation = "0"

		// Get stream data for elevation
		let getElevationData = function() {
			let params = {"id": activity_id, "types": "altitude", "access_token": access_token}
			strava.streams.activity(params, (err, result) => {
				if (err) {
					insertResultToDb(missing_net_elevation)
				} else {
					let altitude_item = null
					result.forEach(item => {
						if (item['type'] == 'altitude') {
							altitude_item = item
						}
					})

					// If we can find altitude data
					if (altitude_item !== null) {
						// Get start and end
						start = parseFloat(altitude_item['data'][0] * 3.281)
						end = parseFloat(altitude_item['data'][altitude_item['data'].length -1] * 3.281)

						// Net elevation change
						net_elevation_change = (end - start).toFixed(2)
						insertResultToDb(net_elevation_change)

					} else {
						insertResultToDb(missing_net_elevation)
					}
				}
			})
		}

		// Insert function
		let insertResultToDb = function(net_elevation_change) {
			// Insert to database			
			let result = {event_id, athlete_name, athlete_email, activity_id, activity_name, 
				activity_type, start_date, elapsed_time, moving_time, elevation_gain, distance}

			if (net_elevation_change) {
				result.net_elevation_change = net_elevation_change
			}

			if (wcr) {
				result.wcr = true
				result.wcr_team = team
				result.wcr_stage = stage
			}
			db.collection('results').insertOne(result, (err, mongo_result) => {
				if (err) {
					res.status(500)
					return res.json({"err": JSON.stringify(err)})
				} else {
					res.sendStatus(200)
				}
			})
		}

		// Filter out duplicates for this event and activity id
		let query = {
			"event_id": {$eq: event_id}, 
			"activity_id": {$eq: activity_id}, 
			"athlete_name": {$eq: athlete_name}
		}
		// For WCR also check stage and team
		if (wcr) {
			query.wcr_team = {$eq: team}
			query.wcr_stage = {$eq: stage}
		}
		db.collection('results').find(query).toArray((err, m_result) => {
			if (err) {
				res.status(500)
				return res.json({"err": JSON.stringify(err)})
			} else {

				// If none - go ahead and submit
				if (m_result.length == 0) {
					// If strava submission, get elevation data
					if (access_token) {
						getElevationData()
					} else if (manual_elevation_change) {
						insertResultToDb(manual_elevation_change)
					} else {
						insertResultToDb(missing_net_elevation)
					}
				} else {
					res.status(400)
					return res.json({"err": "result already inserted"})
				}
			}
		})
	})

	// Get a list of results for a given event
	app.get('/event_results', (req, res) => {
		let event_id = req.query.event_id

		if (!event_id) {
			res.status(400)
			return res.json({"err": "please specify event_id"})
		}

		let query = {"event_id": {$eq: event_id}}
		db.collection('results').find(query).toArray((err, result) => {
			if (err) {
				res.status(500)
				return res.json({"err": JSON.stringify(err)})
			} else {
				res.json(result)
			}
		})
	})

	// Get any results where elevation == 0
	app.get('/missing_elevation_results', (req, res) => {
		let query = {"$or": [{"elevation_gain": {$eq: "0"}}, {"net_elevation_change": {$eq: "MISSING"}} ]}
		db.collection('results').find(query).toArray((err, result) => {
			if (err) {
				res.status(500)
				return res.json({"err": JSON.stringify(err)})
			} else {
				res.json(result)
			}
		})
	})

	//Edit a results elevation
	app.post('/edit_result_elevation', (req, res) => {
		let result_id = req.body.result_id
		let new_elevation_gain = req.body.elevation_gain
		let new_elevation_change = req.body.elevation_change

		if (!result_id || !new_elevation_gain || !new_elevation_change) {
			res.status(400)
			return res.json({"err": "please specify result_id, elevation_gain and elevation_change"})
		}

		let query = {"_id": ObjectID(result_id)}
		let update = {"$set": {"elevation_gain": new_elevation_gain, "net_elevation_change": new_elevation_change}}
		db.collection('results').updateOne(query, update, (err, result) => {
			if (err) {
				res.status(500)
				return res.json({"err": JSON.stringify(err)})
			} else {
				res.sendStatus(200)
			}
		})
	})
}