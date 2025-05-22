const mongoose = require('mongoose');

require('dotenv').config();

const database_mongo = mongoose.connect(process.env.MONGODB_URI);

module.exports = database_mongo;