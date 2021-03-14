const Schema = require('mongoose').Schema;

module.exports.messageSchema = new Schema(
    {
        url: {
            type: String,
            required: true,
            unique: true
        },

        username: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true
        }
});