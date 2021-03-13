const db = require('../db');

module.exports = function(app) {
    app.get('/site/:site', (req, res) => {
        db.sites.set({
            [req.params.site]: {

            }
        })
    })
}