module.exports = (app, db) => {
	app.post('/new_event', (req, res) => {
		let event_name = req.body.name
		let start_time = req.body.start_time
		let end_time = req.body.end_time

		if (!event_name || !start_time || !end_time || end_time <= start_time) {
			res.status(400)
			return res.json({"err": "please specify event_name, start_time and end_time and ensure end_time is after start_time."})
		}

		// Insert to database
		let event = {event_name, start_time, end_time}
		db.collection('events').insertOne(event, (err, result) => {
			if (err) {
				res.status(500)
				return res.json({"err": JSON.stringify(err)})
			} else {
				res.sendStatus(200)
			}
		})
	})

	app.get('/active_events', (req, res) => {
		// Get all events from the database 
		let current_time = Date.now()
		let query = { "start_time": { $lte: current_time }, "end_time": { $gt: current_time }}
		db.collection('events').find(query).toArray((err, result) => {
			if (err) {
				res.status(500)
				return res.json({"err": JSON.stringify(err)})
			} else {
				res.json(result)
			}
		})

	})
}