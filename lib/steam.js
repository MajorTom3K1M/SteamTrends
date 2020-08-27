const axios = require('axios');
const cheerio = require('cheerio');
const Apps = require('../models/apps');
const Details = require('../models/details');
const Record = require('../models/record');

const { createFromSteamAppData } = require('../controllers/steam');

const scheme = "https";
const host = ["api.steampowered.com", "store.steampowered.com", "steamspy.com", "api-v3.igdb.com"];
const igdbKey = "2952b15cf3c81ed5adb0dae1a85cd65c";
const steamKey = "277ACF17650180CD15E26353260E5BEF";

function comparer(otherArray) {
    return function (current) {
        return otherArray.filter(function (other) {
            return other.appid == current.appid && other.name == current.name;
        }).length == 0;
    }
}

function union(a1, a2) {
    var result = [];
    for (var i = 0; i < a1.length; i++) {
        if (a2.indexOf(a1[i]) === -1) {
            result.push(a1[i]);
        }
    }
    for (i = 0; i < a2.length; i++) {
        if (a1.indexOf(a2[i]) === -1) {
            result.push(a2[i]);
        }
    }
    return result;
}

module.exports = {
    GetApps: function (last_appid, attempt = 1) {
        const url = scheme + "://" + host[0] + "/IStoreService/GetAppList/v1/?key=" + steamKey + "&include_games=1" + "&last_appid=" + (last_appid ? last_appid : "");
        // console.log(url);
        return axios({
            url,
            method: 'GET'
        })
            .then((response) => {
                // console.log("Request Apps Attempt : " + attempt);

                if (response.data.response.apps.length > 0) {
                    return response.data.response;
                } else {
                    throw { statusCode: 400, message: "Bad Request from Steam API (GetApps)" }
                }
            })
            .then((gameData) => {
                return gameData;
            })
            .catch((error) => {
                if (error.response) {
                    throw error.response.status;
                } else if (error.statusCode === 400) {
                    setTimeout(() => {
                        return this.GetApps(null, attempt = attempt + 1).catch(err => console.log(err))
                    }, 2400, attempt);
                }

                throw Error("Status 400");
            });
    },
    GetTrendingApps: function () {
        const url = scheme + "://" + host[2];
        return axios({
            url,
            method: 'GET'
        })
            .then((response) => {
                let body = response.data;
                if (response.status !== 200) throw Error('Status 400 : SteamSpy currently unavailable');
                let $ = cheerio.load(body);

                let title = $("table#trendinggames tbody tr a").toArray().map((elem) => elem.children[0].next.data.trim());
                let appid = $("table#trendinggames tbody tr a").toArray().map((elem) => {
                    let elemHref = elem.attribs['href'].split("/");
                    return elemHref[elemHref.length - 1];
                });

                let data = [];
                for (let i in title) {
                    data.push(title[i]);
                }

                return data;
            })
            .then(async (steamSpyData) => {
                const urlIGDB = scheme + "://" + host[3] + "/games";
                const currentDate = Math.floor(Date.now() / 1000);
                let igdbData = await axios({
                    url: urlIGDB,
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'user-key': igdbKey
                    },
                    data: `fields name; limit 100; 
                        where first_release_date < ${currentDate} & first_release_date > ${
                        currentDate - (2592000 * 4)
                        } & cover != null & themes != (42) & category = 0 & platforms = (6); sort popularity desc;`
                });

                let IGDBNameList = igdbData.data.map((item) => (item.name));
                let SteamSpyNameList = steamSpyData;
                let allData = union(IGDBNameList, SteamSpyNameList);

                let countTracking = await Apps.find({ tracking: true }).count();
                if (countTracking > 500) {
                    Apps.updateMany({}, { $set: { tracking: false } }, { multi: true }, (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                }

                // Mark as Tracking to Trends Data
                Apps.updateMany({
                    name: { $in: allData }
                }, {
                    $set: { tracking: true }
                }, {
                    multi: true
                }, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });

                return Apps.aggregate([
                    { $match: { name: { $in: allData } } },
                    {
                        $project: {
                            _id: 0,
                            appid: '$_id',
                            name: '$name',
                            last_modified: '$last_modified'
                        }
                    }
                ]);
            })
            // .then((trends) => {
            //     return trends;
            // })
            .catch((err) => {
                console.error(err);
            });
    },
    GetPlayerCount: (appId) => {
        const url = scheme + "://" + host[0] + "/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=" + appId;
        return axios({
            url,
            method: 'GET'
        })
            .then((response) => {
                if (!response.data.response.player_count) {
                    throw Error("Status 400 : No Player Count");
                }
                return response.data.response.player_count;
            })
            .then((playerCount) => {
                return playerCount;
            })
            .catch((error) => {
                if (error.response) {
                    throw error.response.status;
                }
                // else {
                //     throw Error("Status 500");
                // }
            });
    },
    GetGameDetail: function (appId) {
        const url = scheme + "s://" + host[1] + "/api/appdetails/?appids=" + appId;
        return axios({
            url,
            method: 'GET'
        })
            .then((response) => {
                if (!response.data[`${appId}`].data) {
                    throw Error("Status 400 : No Data");
                }
                return response.data[`${appId}`].data;
            })
            .then((gameDetail) => {
                return gameDetail;
            })
            .catch((error) => {
                if (error.response) {
                    throw error.response.status;
                }
                // else {
                //     throw Error("Status 500");
                // }
            });
    },
    UpdateAppsDatabase: function (last_appid, page = 0) {
        this.GetApps(last_appid)
            .then((response) => {
                const { apps } = response;
                apps.forEach(element => {
                    element._id = element.appid;
                    if (!element.name) {
                        element.name = `Unknown App ${element.appid}`;
                    }
                    delete element.appid;
                    delete element.price_change_number;
                });

                Apps.aggregate([
                    {
                        $project: {
                            _id: 0,
                            appid: '$_id',
                            name: '$name',
                            last_modified: '$last_modified'
                        },
                    },
                    {
                        $limit: 10000
                    },
                    {
                        $skip: 10000 * page
                    }
                ])
                    .then((result) => {
                        setTimeout(() => {
                            // console.log(apps.length);
                            if (result.length !== apps.length) {
                                // Insert New Data
                                let difference = apps.filter(comparer(result));
                                Apps.insertMany(difference)
                                    .then(() => {
                                        console.log("Database Update Successfully ", page);
                                        if (!response.have_more_results) {
                                            this.GetTrendingApps()
                                                .then((trends) => {
                                                    this.UpdateAppDetailsDatabase();
                                                })
                                                .catch(err => {
                                                    console.error(err);
                                                });
                                        }
                                    })
                                    .catch((err) => {
                                        console.error("Insert doc errors");
                                        console.error(err);
                                    });

                                if (response.have_more_results) {
                                    const { last_appid: lastAppId } = response;
                                    this.UpdateAppsDatabase(lastAppId, page + 1);
                                }
                            } else {
                                console.log("Database Already Up to Date (Don't have new data)");
                            }

                            // Update Old Data
                        }, 1700);
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            });
    },
    UpdateAppDetailsDatabase: async function () {
        console.log("UpdateAppDetailsDatabase");
        const result = await Apps.aggregate([
            { $match: { tracking: true } },
            {
                $lookup: {
                    from: "details",
                    localField: "_id",
                    foreignField: "appid",
                    as: "details"
                }
            }, {
                $project: {
                    _id: 0,
                    appid: '$_id',
                    name: '$name',
                    last_modified: '$last_modified',
                    tracking: '$tracking',
                    details: '$details'
                }
            }
        ]);

        const resultFilter = result.filter((item) => (item.details.length === 0));

        for (let i in resultFilter) {
            setTimeout(
                () => {
                    this.GetGameDetail(resultFilter[i].appid)
                        .then((gameDetail) => {
                            let detailObj = new Details(createFromSteamAppData(gameDetail));
                            detailObj.save((err) => {
                                if (err) {
                                    console.error(err);
                                }
                            });
                        })
                        .catch((err) => {
                            console.error(err);
                        });
                },
                i * 1700,
                i
            );
        }
    },
    TrackingConcurrentPlayer: function () {
        let dateTime = new Date();
        Apps.aggregate([
            { $match: { tracking: true } },
            {
                $project: {
                    _id: 0,
                    appid: '$_id',
                    name: '$name'
                }
            }
        ])
            .then(async (trackingList) => {
                let appIdList = trackingList.map(item => (item.appid));
                let recordList = await Record.aggregate([
                    { $match: { appid: { $in: appIdList } } },
                    {
                        $project: {
                            appid: "$appid"
                        }
                    }
                ]);
                let recordAppIdList = recordList.map(item => (item.appid));
                console.log(trackingList);
                console.log(appIdList);
                console.log(recordAppIdList);
                for (let i in trackingList) {
                    setTimeout(() => {
                        this.GetPlayerCount(trackingList[i].appid)
                            .then((playerCount) => {
                                // console.log("player count : ", playerCount, " name : ", trackingList[i].name);
                                let count = playerCount ? playerCount : 0;
                                // if already have old record
                                if (recordAppIdList.indexOf(trackingList[i].appid) !== -1) {
                                    Record.updateOne({ appid: trackingList[i].appid }, { $push: { ccu: { dateTime, count }, $slice: -4368 } }, (err) => {
                                        if (err) {
                                            console.log("Update Record Failed");
                                            console.error(err);
                                        } else {
                                            console.log("update time : ", dateTime, "player count : ", playerCount, " name : ", trackingList[i].name);
                                        }
                                    });
                                } else {
                                    let recordObj = new Record({ appid: trackingList[i].appid, ccu: [{ dateTime, count }] });
                                    recordObj.save((err) => {
                                        if (err) {
                                            console.error(err);
                                        }
                                        console.log("save time : ", dateTime, "player count : ", playerCount, " name : ", trackingList[i].name);
                                    });
                                }
                            })
                            .catch((err) => {
                                console.log("ERROR: ", trackingList[i].name, "ID: ", trackingList[i].appid)
                                console.error(err);
                            });
                    }, 1500 * i, i);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }
}