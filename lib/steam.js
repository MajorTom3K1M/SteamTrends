const axios = require('axios');
const cheerio = require('cheerio');
const Apps = require('../models/apps');
const { all } = require('bluebird');

const scheme = "https";
const host = ["api.steampowered.com", "store.steampowered.com", "steamspy.com", "api-v3.igdb.com"];
const igdbKey = "2952b15cf3c81ed5adb0dae1a85cd65c";
const steamKey = "277ACF17650180CD15E26353260E5BEF";

// https://api-v3.igdb.com/games
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
        console.log(url);
        return axios({
            url,
            method: 'GET'
        })
            .then((response) => {
                console.log("Request Apps Attempt : " + attempt);

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
                        return this.GetApps(attempt = attempt + 1).catch(err => console.log(err))
                    }, 2400, attempt);
                }

                throw Error("Status 400");
            });
    },
    GetTrendingApps: () => {
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

                let countTracking = Apps.find({ tracking: true }).count();
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
            .then((trends) => {
                return trends;
            })
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
    GetGameDetail: (appId) => {
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
                        console.log(apps.length);
                        if (result.length !== apps.length) {
                            let difference = apps.filter(comparer(result));
                            console.log("My database : ", result.length, " Steam database : ", apps.length, " difference : ", difference.length);
                            Apps.insertMany(difference, (err, doc) => {
                                if (err) {
                                    console.error("Insert doc errors");
                                    console.error(err);
                                } else {
                                    console.log("Database Update Successfully ", page);
                                }
                            });

                            if (response.have_more_results) {
                                const { last_appid: lastAppId } = response;
                                setTimeout(() => {
                                    this.UpdateAppsDatabase(lastAppId, ++page);
                                }, 1700);
                            }
                        } else {
                            console.log("Database Already Up to Date");
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            });
    }
}