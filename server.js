require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const cors = require('cors')
const strava = require('strava-v3')
const path = require('path')
const cfenv = require("cfenv");
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;

// Connect to Mongo and terminate if failed.
const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@dan-mrvd9.mongodb.net/${process.env.MONGODB_DB_NAME}?retryWrites=true&w=majority`
const mongo_client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
mongo_client.connect(err => {
	if (err) {
		console.log(err)
		mongo_client.close();
		process.exit(0)
	} 
	console.log('Connected to mongodb.')
	const db = mongo_client.db(process.env.MONGODB_DB_NAME);

	// Setup app
	app.use(cors())
	app.use(bodyParser.json())

	strava.config({
	  "client_id"     : process.env.STRAVA_CLIENT_ID,
	  "client_secret" : process.env.STRAVA_CLIENT_SECRET,
	  "redirect_uri"  : "https://localhost:3000",
	});

	app.use('/', express.static(path.join(__dirname, 'ui')))

	// Routes
	require('./routes/auth.js')(app, db, strava)
	require('./routes/events.js')(app, db)
	require('./routes/results.js')(app, db)
	require('./routes/athletes.js')(app, db, strava)

	// Start server
	app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
});


