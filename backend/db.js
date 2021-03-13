const admin = require('firebase-admin');
const db = admin.database();

module.exports.sites = db.ref("sites");          // Site data stored here
//module.exports.resources = db.ref("res");        // Images and GIFs stored here