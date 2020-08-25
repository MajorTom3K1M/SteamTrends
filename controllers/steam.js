module.exports = {
    createFromSteamData: (app) => {
        const {
            appid,
            name
        } = app;
        return {
            _id: appid,
            name
        }
    },
    createFromSteamAppData: (appData) => {
        let app = {
            type: appData.type ? appData.type : "",
            name: appData.name ? appData.name : "",
            appid: appData.steam_appid ? appData.steam_appid : "",
            required_age: appData.required_age,
            is_free: appData.is_free,
            controller_support: appData.controller_support  ? appData.controller_support : "",
            detailed_description: appData.detailed_description ? appData.detailed_description : "",
            about_the_game: appData.about_the_game ? appData.about_the_game : "",
            short_description: appData.short_description ? appData.short_description : "",
            supported_languages: appData.supported_languages ? appData.supported_languages : "",
            header_image: appData.header_image ? appData.header_image : "",
            website: appData.website ? appData.website : "",
            pc_requirements: appData.pc_requirements ? appData.pc_requirements : "",
            mac_requirements: appData.mac_requirements ? appData.mac_requirements : "",
            linux_requirements: appData.linux_requirements ? appData.linux_requirements : "",
            developers: appData.developers ? appData.developers : [],
            publishers: appData.publishers ? appData.publishers : [],
            platforms: appData.platforms ? appData.platforms : "",
            metacritic: appData.metacritic ? appData.metacritic : "",
            categories: appData.categories ? appData.categories : [],
            screenshots: appData.screenshots ? appData.screenshots : [],
            release_date: appData.release_date ? appData.release_date : "",
            movies: appData.movies ? appData.movies : [],
            recommendations: appData.recommendations ? appData.recommendations : "",
            background: appData.background ? appData.background : "",
            content_descriptors: appData.content_descriptors ? appData.content_descriptors : "",
            package_groups: appData.package_groups ? appData.package_groups : []
        };
        return app;
    }
};