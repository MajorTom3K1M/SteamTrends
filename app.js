const express = require('express');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const axios = require('axios');
const steam = require('./lib/steam');
const mongoose = require('mongoose');
const { createFromSteamData, createFromSteamAppData } = require('./controllers/steam');
const Apps = require('./models/apps');
const Record = require('./models/record');
const Details = require('./models/details');

const app = express();

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/steam-database', { useNewUrlParser: true })
    .then(() => console.log("Conected to mongodb"))
    .catch(() => console.log("Error to connected"));
mongoose.Promise = global.Promise;

// steam.GetApps()
//     .then((apps) => {
//         Apps.aggregate([
//             {
//                 $project: {
//                     _id: 0,
//                     appid: '$_id',
//                     name: '$name'
//                 }
//             }
//         ])
//             .then((result) => {
//                 if(result.length !== apps.length) {
//                     let data = apps.filter(comparer(result));
//                     // let difference = apps.filter(comparer(result));
//                     console.log("My database : ", result.length, " Steam database : ", apps.length, " difference : ", data.length);
//                     console.log(data);

//                     for (let index in data) {
//                         setTimeout(
//                             () => {
//                                 let appObject = new Apps(createFromSteamData(data[index]));
//                                 appObject.save((err) => {
//                                     if (err) {
//                                         console.error(err);
//                                     }
//                                 });
//                                 steam.GetGameDetail(data[index].appid)
//                                     .then((gameDetail) => {
//                                         let detailsObject = new Details(createFromSteamAppData(gameDetail));
//                                         detailsObject.save((err) => {
//                                             if (err) {
//                                                 console.error(err);
//                                             }
//                                         });
//                                     })
//                                     .catch((err) => {
//                                         console.error(err);
//                                     });
//                             },
//                             index * 1500,
//                             index
//                         );
//                     }
//                 }
//             })
//             .catch((err) => {
//                 console.error(err);
//             });
//     })
//     .catch((err) => {
//         console.error(err);
//     });


// steam.GetApps()
//     .then((apps) => {
//         console.log(apps)
//         Apps.aggregate([
//             {
//                 $project: {
//                     _id: 0,
//                     appid: '$_id',
//                     name: '$name'
//                 }
//             }
//         ])
//             .then((result) => {
//                 if (result.length !== apps.length) {
//                     let difference = apps.filter(comparer(result));
//                     console.log("My database : ", result.length, " Steam database : ", apps.length, " difference : ", difference.length);

//                     Apps.insertMany(difference, (err, doc) => {
//                         if(err) {
//                             console.error("Insert doc errors")
//                         }
//                     })
//                 }
//             })
//             .catch((err) => {
//                 console.error(err);
//             });
//     })
//     .catch((err) => {
//         console.log(err)
//     });

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), () => {
    console.log(`listen to port ${app.get('port')}`);
});
