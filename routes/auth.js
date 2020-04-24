module.exports = (app, db, strava) => {
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
}