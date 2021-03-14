const Schema = require('mongoose').Schema;

module.exports.messageSchema = new Schema(
    {
        url: {
            type: String,
            required: true
        },

        username: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true
        },

        isImage: {
            type: Boolean,
            default: false
        }
}, {
        timestamps: {
            currentTime: () => Date.now(),
            createdAt: 'timestamp'
        }
    });