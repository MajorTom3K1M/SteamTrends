const axios = require('axios');

const scheme = "http";
const host = ["api.steampowered.com", "store.steampowered.com"];

module.exports = {
    GetApps: (attempt = 1) => {
        const url = scheme + "://" + host[0] + "/ISteamApps/GetAppList/v2/";
        return axios({
            url,
            method: 'GET'
        })
            .then((response) => {
                console.log("Request Apps Attempt : " + attempt);
                
                if(response.data.applist.apps.length > 0) {
                    return response.data.applist.apps;
                }

                setTimeout(() => {
                    return this.GetApps(attempt++);
                }, attempt * 2400, attempt);
            })
            .then((gameData) => {
                return gameData;
            })
            .catch((error) => {
                if (error.response) {
                    throw error.response.status;
                } else {
                    throw Error("Status 500");
                }
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
                    throw Error("Status 500");
                }
                return response.data.response.player_count;
            })
            .then((playerCount) => {
                return playerCount;
            })
            .catch((error) => {
                // console.log("error");
                // console.log(error.request.url);
                if (error.response) {
                    throw error.response.status;
                } else {
                    throw Error("Status 500");
                }
            });
    },
    GetGameDetail: (appId) => {
        const url = scheme + "s://" + host[1] + "/api/appdetails/?appids=" + appId;
        return axios({
            url,
            method: 'GET'
        })
            .then((response) => {
                if(!response.data[`${appId}`].data) {
                    throw Error("Status 500");
                }
                return response.data[`${appId}`].data;
            })
            .then((gameDetail) => {
                return gameDetail;
            })
            .catch((error) => {
                // console.log(error);
                // console.log(error.request.url);
                if (error.response) {
                    throw error.response.status;
                } else {
                    throw Error("Status 500");
                }
            });
    }
}