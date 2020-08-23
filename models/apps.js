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
    last_modified: {
        type: Number
    },
    tracking: {
        type: Boolean
    }
});

module.exports = mongoose.model('Apps', AppsSchema, 'apps');