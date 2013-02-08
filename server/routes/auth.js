var passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy,
    api = require('../api'),
    config = require('../../config'),
    User = require('../models/user'),
    auth;

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (obj, done) {
  User.findById(obj, function (err, user) {
    done(err, user);
  });
});

passport.use('github', new GitHubStrategy({
    clientID: config.github.clientID,
    clientSecret: config.github.clientSecret,
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  function (accessToken, refreshToken, profile, done) {
    var findParams = {oauthProvider:'github', oauthAccessToken:accessToken},
        createParams = {username:profile.username};

    User.findOrCreate(findParams, createParams, function (err, user) {
      done(err, user);
    })
  })
);

auth = {
  requireUser: function (req, res, next) {
    res.locals.user = req.user;
    if (req.isAuthenticated()) {
      next();
    }
    else {
      if (req.is('json')) {
        api.unauthorized(req, res);
      }
      else {
        if (req.path === '/') {
          res.render('index', { message: "Sign in to rate amazing beers." });
        }
        else {
          req.session.storedLocation = req.path;
          res.redirect('/');
        }
      }
    }
  },

  logout: function (req, res, next) {
    req.logout();
    res.redirect('/');
  }
};

module.exports = function (app) {
  app.get('/auth/github', passport.authenticate('github'), function (req, res, next) {});
  app.get('/auth/github/callback', passport.authenticate('github', {failureRedirect: '/'}),
    function (req, res, next) {
      res.redirect(req.session.storedLocation || '/');
      delete req.session.storedLocation;
    });
  app.get('/logout', auth.logout);
  app.all('*', auth.requireUser);
};
