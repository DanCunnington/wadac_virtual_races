module.exports = (app, db, strava) => {
	// Get a list of recent activities from a given athlete
	app.get('/athlete_activities', (req, res) => {
		let access_token = req.query.access_token

		if (!access_token) {
			res.status(400)
			return res.json({"err": "please specify an access_token"})
		}

		let params = {"access_token": access_token, "per_page": 20}
		strava.athlete.listActivities(params, (err, result) => {
			if (err) {
				res.status(500)
				return res.json({"err": JSON.stringify(err)})
			}
			res.json(result)
		})
	})
}