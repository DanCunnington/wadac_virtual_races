module.exports = (app, db) => {

	// Add a new result for an event
	app.post('/submit_result', (req, res) => {
		let event_id = req.body.event_id
		let athlete_name = req.body.athlete_name
		let activity_name = req.body.activity_name
		let activity_id = req.body.activity_id
		let elapsed_time = req.body.elapsed_time
		let start_date = req.body.start_date
		let moving_time = req.body.moving_time
		let elevation_gain = req.body.elevation_gain
		let distance = req.body.distance

		if (!event_id || !activity_name || !activity_id || !start_date || !athlete_name || 
			!elapsed_time || !moving_time || ! elevation_gain || !distance) {
			res.status(400)
			return res.json({"err": "please specify event_id, athlete_name, activity_id, "+
				"activity_name, start_date, elapsed_time, moving_time, elevation_gain and distance"})
		}

		// Insert function
		let insertResultToDb = function() {
			// Insert to database
			let result = {event_id, athlete_name, activity_id, activity_name, start_date, 
				elapsed_time, moving_time, elevation_gain, distance}
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
		db.collection('results').find(query).toArray((err, m_result) => {
			if (err) {
				res.status(500)
				return res.json({"err": JSON.stringify(err)})
			} else {

				// If none - go ahead and submit
				if (m_result.length == 0) {
					insertResultToDb()
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
}