# wadac_virtual_races_server

# Installation
`npm install`

.env file:  
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
MONGODB_USER=
MONGODB_PASS=
MONGODB_DB_NAME_DEV=
MONGODB_DB_NAME_PROD=
ADMIN_PASS=

# Run
`node server.js`

# Deploy
1) Build the ui  
```
cd wadac-virtual-races-ui
npm run build
```

2) Deploy to IBM Cloud  
```
ibmcloud login -a api.eu-gb.bluemix.net --sso
ibmcloud target --cf
npm run deploy
```

