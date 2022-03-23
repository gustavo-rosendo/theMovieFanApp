var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const config = require('./config');

const sessions = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

var indexRouter = require('./routes/index');

var app = express();

const helmet = require('helmet');
app.use(helmet({ 
  contentSecurityPolicy: false,  
  crossOriginEmbedderPolicy: false /* allows resources (img, etc.) to load from cross-origin sites */ 
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//========= PASSPORT CONFIG! =========
app.use(sessions({
  secret: 'My favorite dog was Pirata!',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new GitHubStrategy({
    clientID: config.PASSPORT.GITHUB_CLIENT_ID,
    clientSecret: config.PASSPORT.GITHUB_CLIENT_SECRET,
    callbackURL: config.PASSPORT.CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }
))
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  console.log("deserializing user ...");
  cb(null, user);
})

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
