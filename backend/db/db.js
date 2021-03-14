/**
 * Defines the connection to the database
 * and initialises models from the schema
 */

const mongoose = require('mongoose');
const schema = require('./schema')

// Define mongodb connection
let url = 'mongodb://127.0.0.1:27017/chromeChats';
let options = {
    "useNewUrlParser": true,
    "useUnifiedTopology": true,
    "useCreateIndex": true,
    "useFindAndModify": false
}


// Listen for successful connection
mongoose.connection.once('open', _ => {
    console.log('Database connected:', url);
});

// Listen for errors
mongoose.connection.on('error', err => {
    handleError(err);
});

// Initialise connection
mongoose
    .connect(url, options)
    .catch(err => handleError(err))
    .then();

// Handle an error
function handleError(err) {
    console.error(err);
}


// Add models and export
module.exports.messageConn = mongoose.connection.model('users', schema.messageSchema);
