module.exports = (app, db, strava, auth_creds) => {
	app.get('/get_client_id', (req, res) => {
		res.json({"client_id": process.env.STRAVA_CLIENT_ID})
	})

	app.get('/get_access_token', (req, res) => {
		strava.oauth.getToken(req.query.code, (err, result, body) => {
			if (err) {
				console.log(err)
				res.status(401)
				return res.json({"err": err})
			}
			if (body.access_token && body.expires_at && body.refresh_token && 
				body.athlete && body.athlete.firstname && body.athlete.lastname) {
				access_token = body.access_token
				expires_at = body.expires_at
				refresh_token = body.refresh_token
				user_name = body.athlete.firstname + ' ' + body.athlete.lastname
				return res.json({access_token, refresh_token, expires_at, user_name})
			} else {
				res.status(500)
				return res.json({"err": err})
			}
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
		.catch((err) => {
			res.status(500)
			res.json({"err": err})
		})
	})

	app.post('/is_admin', (req, res) => {
		let pass = req.body.password
		if (pass == process.env.ADMIN_PASS) {
			res.json({"logged_in": true})
		} else {
			res.json({"logged_in": false})	
		}
	})
}