const model = require('./db').messageConn;

module.exports.addMessage = function(url, username, message, isImage, cb) {
    if (!url || !username || !message) {
        cb(false);
    }

    if (isImage) {
        blobToB64(message)
            .catch(err => {
                console.log(err);
                cb(false);
            })
            .then((b64) => save(url, username, b64, isImage, cb));
    } else {
        save(url, username, message, isImage, cb);
    }
}

module.exports.getMessages = function(url, cb) {
    model.find({'url': url})
        .catch(err => {
            console.log(err);
            cb(null);
        })
        .then(res => {
            res.timestamp = res._id.getTimestamp();

            if (res.isImage) {
                res.message = b64toBlob(res.message);
            }

            delete res._id;
            cb(res);
        });
}

function save(url, username, message, isImage, cb) {
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

function blobToB64(blob) {
    return new Promise(((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            resolve(reader.result);
        }

        reader.onerror = err => {
            reject(err);
        }

        reader.readAsDataURL(blob);
    }))
}

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    let byteChars = atob(b64Data);
    let byteArrs = [];

    for (let offset = 0; offset < byteChars.length; offset += sliceSize) {
        let slice = byteChars.slice(offset, offset + sliceSize);

        let byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        let arr = new Uint8Array(byteNumbers);

        byteArrs.push(arr);
    }

    return new Blob(byteArrs, {type: contentType});
}