const express = require('express');
const bodyParser = require('body-parser');
const steam = require('./lib/steam');
const mongoose = require('mongoose');

const app = express();

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/steamdb', { useNewUrlParser: true })
    .then(() => console.log("Conected to mongodb"))
    .catch(() => console.log("Error to connected"));
mongoose.Promise = global.Promise;

// steam.UpdateAppsDatabase();
steam.TrackingConcurrentPlayer();

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), () => {
    console.log(`listen to port ${app.get('port')}`);
});
