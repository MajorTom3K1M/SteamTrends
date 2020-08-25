const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
    appid: {
        type: Number,
        required: true,
    },
    ccu: {
        type: Array
    }
});

module.exports = mongoose.model('Record', RecordSchema, 'record');