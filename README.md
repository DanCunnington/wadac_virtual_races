# wadac_virtual_races_server

# Installation
`npm install`

.env file:  
CLIENT_ID=   
CLIENT_SECRET=  
CLUB_ID=  

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

