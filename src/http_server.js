var settings = require('./settings');

module.exports.initialize = function(express, app, http, callback) {
    // if someone enters the page, show him the main view
    app.get('/', function(req, res, next) {
        res.redirect('index.html');
    });

    // expose public resources
    app.use(express.static('./public/views'));
    app.use(express.static('./public/styles'));
    app.use(express.static('./public/controllers'));

    return http.listen(settings.PORT, callback);
};
