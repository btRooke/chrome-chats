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

module.exports.getMessages = function(url, has, wants, cb) {
    model.find({'url': url})
        .sort('-timestamp')
        .skip(has)
        .limit(wants)
        .sort('timestamp')
        .catch(err => {
            console.log(err);
            cb(null);
        })
        .then(res => {
            res.forEach(doc => console.log(doc.timestamp));
            cb(res);
        });
}
