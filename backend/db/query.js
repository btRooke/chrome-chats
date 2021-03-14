const model = require('./db').messageConn;

module.exports.addMessage = function(url, username, message, isImage, cb) {
    if (!url || !username || !message) {
        cb(null);
    }

    let instance = new model({
        'url': url,
        'username': username,
        'message': message,
        'isImage': isImage
    });

    instance.save()
        .catch(err => {
            console.log(err);
            cb(null);
        })
        .then(() => cb(instance));
}

module.exports.getMessages = function(url, has, cb) {
    model.find({'url': url})
        .sort({timestamp: 1})
        .catch(err => {
            console.log(err);
            cb(null);
        })
        .then(res => {
            cb(res);
        });
}
