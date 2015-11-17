var mongoose = require('mongoose');
var settings = require('./settings');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var path = require('path');
var allGamesReq = require('./models/AllGames');

module.exports.initialize = function(express, app, http, callback) {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });

    var mongoStore = new MongoStore({
        mongooseConnection: mongoose.connection,
        collection: 'sessions',
        reapInterval: 600000 // 10 minutes
    });

    allGamesReq.createGame()

    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(session({
        maxAge: new Date(Date.now() + 3600000),
        store: mongoStore,
        secret: 'ala123',
        resave: true,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    var Account = require('./models/account');
    passport.use(Account.createStrategy());
    passport.serializeUser(Account.serializeUser());
    passport.deserializeUser(Account.deserializeUser());

    // expose public resources
    app.use(express.static('./frontend/public'));

    app.get('/', function (req, res, next) {
        res.render('index', { user : req.user });
    });

    app.get('/register', function(req, res, next) {
        res.render('register', { });
    });

    app.post('/register', function(req, res, next) {
        Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
            if (err) {
              return res.render("register", {info: "Sorry. That username already exists. Try again."});
            }

            passport.authenticate('local')(req, res, function () {
              res.redirect('/');
            });
        });
    });

    app.get('/login', function(req, res, next) {
        res.render('login', { user : req.user });
    });

    app.post('/login', passport.authenticate('local'), function(req, res) {
        res.redirect('/');
    });

    app.get('/logout', function(req, res, next) {
        req.logout();
        res.redirect('/');
    });

    app.get('/start/', function(req, res, next) {
        if (req.user) {
          res.sendFile(path.resolve(__dirname + '/../frontend/start.html'));
        } else {
          res.redirect('/');
        }
    });

    app.post('/create_game', function (req, res) {
        if (req.user) {
            console.log(req.user);
            console.log(req.body);
        } else {
            console.log('no logged user');
        }
    });

    return http.listen(settings.PORT, callback);
};
