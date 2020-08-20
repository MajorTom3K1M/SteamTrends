const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
    appid: {
        type: Number,
        required: true,
        ref: 'Apps'
    },
    nop: {
        type: Array
    }
});

module.exports = mongoose.model('Record', RecordSchema, 'record');