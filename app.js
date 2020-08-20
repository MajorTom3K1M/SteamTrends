const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const steam = require('./lib/steam');
const mongoose = require('mongoose');
const { createFromSteamData, createFromSteamAppData } = require('./controllers/steam');
const Apps = require('./models/apps');
const Record = require('./models/record');
const Details = require('./models/details');

const app = express();

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/steam', { useNewUrlParser: true });
mongoose.Promise = global.Promise;

// steam.GetApps()
//     .then((apps) => {
//         console.log(apps.length);
//         let date = new Date();
//         let dateFormat = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
//         for (let index in apps) {
//             setTimeout(
//                 () => {
//                     let appObject = new Apps(createFromSteamData(apps[index]));
//                     appObject.save((err) => {
//                         if (err) {
//                             console.error(err);
//                         }
//                     });

//                     steam.GetPlayerCount(apps[index].appid)
//                         .then((playerCount) => {
//                             Record.findOne({ appid: apps[index].appid })
//                                 .then((result) => {
//                                     if (!result || result === null) {
//                                         let recordObj = {
//                                             appid: apps[index].appid,
//                                             nop: [{ date: dateFormat, playerCount }]
//                                         };
//                                         let record = new Record(recordObj);
//                                         record.save((err) => {
//                                             console.log(playerCount, apps[index].name, apps[index].appid);
//                                             if (err) {
//                                                 console.error(err);
//                                             }
//                                         });
//                                     } else {
//                                         console.log("UPDATE");
//                                         let recordObj = {
//                                             date: dateFormat, playerCount
//                                         }
//                                         Record.updateOne({ appid: apps[index].appid }, { $push: { nop: recordObj } })
//                                             .then((success) => {
//                                                 console.log("success");
//                                             })
//                                             .catch((err) => {
//                                                 console.error(err);
//                                             })
//                                     }
//                                 })
//                                 .catch((err) => {
//                                     console.error(err)
//                                 });

//                         })
//                         .catch((err) => {
//                             // console.error(err);
//                         });
//                 },
//                 index * 2400,
//                 index
//             );
//         }
//     })
//     .catch((err) => {

//     });


// steam.GetApps()
//     .then((apps) => {
//         console.log(apps.length);
//         for (let index in apps) {
//             setTimeout(
//                 () => {
//                     let appObject = new Apps(createFromSteamData(apps[index]));
//                     appObject.save((err) => {
//                         if (err) {
//                             console.error(err);
//                         }
//                     });
//                     steam.GetGameDetail(apps[index].appid)
//                         .then((gameDetail) => {
//                             let detailsObject = new Details(createFromSteamAppData(gameDetail));
//                             detailsObject.save((err) => {
//                                 if (err) {
//                                     console.error(err);
//                                 }
//                             });
//                         })
//                         .catch((err) => {
//                             console.error(err);
//                         });
//                 },
//                 index * 1714,
//                 index
//             );
//         }
//     })
//     .catch((err) => {
//         console.error(err);

//     });

// steam.GetApps()
//     .then((apps) => {
//         console.log(apps.length);
//         Apps.find({})
//             .then(())
//         // apps.filter(() => {})
//     })
//     .catch((err) => {

//     })

steam.GetApps()
    .then((apps) => {
        Apps.aggregate([
            {
                $project: {
                    _id: 0,
                    appid: '$_id',
                    name: '$name'
                }
            }
        ]).then((result) => {
            let difference = apps.filter(comparer(result));
            console.log("My database : ", result.length, " Steam database : ", apps.length, " difference : ", difference.length);
            // for (let index in apps) {
            //     setTimeout(
            //         () => {
            //             let appObject = new Apps(createFromSteamData(apps[index]));
            //             appObject.save((err) => {
            //                 if (err) {
            //                     console.error(err);
            //                 }
            //             });
            //             steam.GetGameDetail(apps[index].appid)
            //                 .then((gameDetail) => {
            //                     let detailsObject = new Details(createFromSteamAppData(gameDetail));
            //                     detailsObject.save((err) => {
            //                         if (err) {
            //                             console.error(err);
            //                         }
            //                     });
            //                 })
            //                 .catch((err) => {
            //                     console.error(err);
            //                 });
            //         },
            //         index * 1714,
            //         index
            //     );
            // }
        })
            .catch((err) => {
                console.error(err);
            });
    })
    .catch((err) => {
        console.error(err);
    });

function comparer(otherArray) {
    return function (current) {
        return otherArray.filter(function (other) {
            return other.appid == current.appid;
        }).length == 0;
    }
}