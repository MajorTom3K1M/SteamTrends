const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AppsSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('Apps', AppsSchema, 'apps');