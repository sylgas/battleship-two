var mongoose = require('mongoose');
var settings = require('./settings');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo/es5')(session);
var path = require('path');

module.exports.initialize = function(express, app, http, callback) {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {
        layout: false
    });

    var mongoStore = new MongoStore({
        mongooseConnection: mongoose.connection,
        collection: 'sessions',
        reapInterval: 600000 // 10 minutes
    });

    app.use(bodyParser.urlencoded({
        extended: false
    }));


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

    app.get('/', function(req, res, next) {
        res.render('index', {
            user: req.user
        });
    });

    app.get('/register', function(req, res, next) {
        res.render('register', {});
    });

    app.post('/register', function(req, res, next) {
        Account.register(new Account({
            email : req.body.email,
            username: req.body.username
        }), req.body.password, function(err, account) {
            if (err) {
                // TODO check email field is valid
                return res.render("register", {
                    info: "Sorry. That username already exists. Try again."
                });
            }

            passport.authenticate('local')(req, res, function() {
                res.redirect('/');
            });
        });
    });

    app.get('/resetpass', function(req, res) {
        res.render('resetpass', {});
    });

    var genPassword = require('password-generator');
    app.post('/resetpass', function(req, res) {
      Account.findByUsername(req.body.username, function (err, account) {
        if (err || !account) {
            return res.render("resetpass", {
                info: "Sorry, could not find this user."
            });
        } else {
          if(account.email === req.body.email) {
            var password = genPassword();
            account.setPassword(password, function(err) {
              if (!err) {
                  account.save(function(error){
                      if (error) {
                        return res.render("resetpass", {
                            info: "Error occured." + error
                        });
                      }
                  });
              } else {
                return res.render("resetpass", {
                    info: "Error occured." + err
                });
              }
            });

            return res.render("resetpass", {
                info: "New password is: "+password
            });
          } else {
            return res.render("resetpass", {
                info: "Wrong email, are you sure this is you?"
            });
          }
        }
      });

    });

    app.get('/login', function(req, res, next) {
        res.render('login', {
            user: req.user
        });
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
            console.log(req.user);
            res.cookie('user', JSON.stringify(req.user));
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
