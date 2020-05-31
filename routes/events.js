const ObjectID = require('mongodb').ObjectID;
module.exports = (app, db) => {
	app.post('/new_event', (req, res) => {
		let event_name = req.body.name
		let start_time = req.body.start_time
		let end_time = req.body.end_time
		let distance = req.body.distance
		let elevation_gain = req.body.elevation_gain
		let elevation_change = req.body.elevation_change
		let wcr_event = false
		if (Object.keys(req.body).indexOf('wcr_event') > -1) {
			wcr_event = req.body.wcr_event
		}

		if (!event_name || !start_time || !end_time || end_time <= start_time) {
			res.status(400)
			return res.json({"err": "please specify event_name, start_time and end_time and ensure end_time is after start_time."})
		}

		if (!wcr_event && (!distance || !elevation_gain || !elevation_change)) {
			res.status(400)
			return res.json({"err": "please specify distance, elevation gain and elevation change for non welsh castles events."})
		}

		// Insert to database
		let event = {event_name, start_time, end_time, wcr_event}
		if (!wcr_event) {
			event.distance = distance
			event.elevation_gain = elevation_gain
			event.elevation_change = elevation_change
		}
		db.collection('events').insertOne(event, (err, result) => {
			if (err) {
				res.status(500)
				return res.json({"err": JSON.stringify(err)})
			} else {
				res.sendStatus(200)
			}
		})
	})

	app.post('/edit_event', (req, res) => {
		let event_name = req.body.name
		let start_time = req.body.start_time
		let end_time = req.body.end_time
		let _id = req.body._id
		let wcr_event = false
		let distance = req.body.distance
		let elevation_gain = req.body.elevation_gain
		let elevation_change = req.body.elevation_change

		if (Object.keys(req.body).indexOf('wcr_event') > -1) {
			wcr_event = req.body.wcr_event
		}

		if (!_id || !event_name || !start_time || !end_time || end_time <= start_time) {
			res.status(400)
			return res.json({"err": "please specify id, event_name, start_time and end_time and ensure end_time is after start_time."})
		}

		if (!wcr_event && (!distance || !elevation_gain || !elevation_change)) {
			res.status(400)
			return res.json({"err": "please specify distance, elevation gain and elevation change for non welsh castles events."})
		}

		// Insert to database
		let event = {event_name, start_time, end_time, wcr_event}
		if (!wcr_event) {
			event.distance = distance
			event.elevation_gain = elevation_gain
			event.elevation_change = elevation_change
		}
		let query = {"_id": ObjectID(_id)}
		let update = {"$set": event}
		db.collection('events').updateOne(query, update, (err, result) => {
			if (err) {
				res.status(500)
				return res.json({"err": JSON.stringify(err)})
			} else {
				res.sendStatus(200)
			}
		})
	})

	app.post('/delete_event', (req, res) => {
		let _id = req.body._id

		if (!_id) {
			res.status(400)
			return res.json({"err": "please specify event id to delete."})
		}

		// Insert to database
		let query = {"_id": ObjectID(_id)}
		db.collection('events').deleteOne(query, (err, result) => {
			if (err) {
				res.status(500)
				return res.json({"err": JSON.stringify(err)})
			} else {
				res.sendStatus(200)
			}
		})
	})

	app.get('/active_events', (req, res) => {
		// Get active events from the database 
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

	app.get('/all_events', (req, res) => {
		// Get all events from the database 
		db.collection('events').find({}).toArray((err, result) => {
			if (err) {
				res.status(500)
				return res.json({"err": JSON.stringify(err)})
			} else {
				res.json(result)
			}
		})
	})
}