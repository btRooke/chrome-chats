const model = require('./db').messageConn;

module.exports.addMessage = function(url, username, message, isImage, cb) {
    if (!url || !username || !message) {
        cb(false);
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
            cb(false);
        })
        .then(() => cb(true));
}

module.exports.getMessages = function(url, cb) {
    model.find({'url': url})
        .catch(err => {
            console.log(err);
            cb(null);
        })
        .then(res => {
            if (res) {
                res.forEach((doc) => {
                    doc.timestamp = doc._id.getTimestamp();
                    delete doc._id;
                });
            }
            cb(res);
        });
}
