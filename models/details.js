const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DetailsSchema = Schema({
    appid: {
        type: Number,
        required: true,
        ref: 'Apps'
    },
    type: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    required_age: {
        type: String,
    },
    is_free: {
        type: String,
    },
    detailed_description: {
        type: String,
    },
    about_the_game: {
        type: String,
    },
    short_description: {
        type: String,
    },
    supported_languages: {
        type: String,
    },
    header_image: {
        type: String,
    },
    website: {
        type: String,
    },
    pc_requirements: {
        type: Object,
    },
    mac_requirements: {
        type: Object,
    },
    linux_requirements: {
        type: Object,
    },
    release_date: {
        type: Object,
    },
    developers: {
        type: Array,
    },
    publishers: {
        type: Array,
    },
    price_overview: {
        type: Object,
    },
    platforms: {
        type: Object,
    },
    metacritic: {
        type: Object,
    },
    categories: {
        type: Array,
    },
    genres: {
        type: Array,
    },
    screenshots: {
        type: Array,
    },
    movies: {
        type: Array,
    },
    recommendations: {
        type: Object,
    }
});

DetailsSchema.post('save', function () {
    const { appid, type, name } = this;
    console.log(`Insert Game Detail : ID:${appid} Type:${type} Game:${name}`);
});

module.exports = mongoose.model('Details', DetailsSchema, 'details');