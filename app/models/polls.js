'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
    _id: String,
    question: String,
    choiceList: Object,
    users: Object,
    ips: Object
});

module.exports = mongoose.model('Poll', Poll);