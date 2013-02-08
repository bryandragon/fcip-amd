var _ = require('underscore'),
    api = require('../api'),
    Beer = require('../models/beer'),
    beers;

beers = {
  /**
   * Return all beers.
   * Options:
   *   limit {Number} optional
   */
  all: function (req, res, next) {
    var query = Beer.find().select('-ratings');
    query.exec(function (err, beers) {
      if (err) return api.serverError(req, res);
      api.ok(req, res, beers || []);
    });
  },

  /**
   * Return beers that have not been rated by the
   * specified user id; if no id is specified, assumes
   * current user. If limit is 1, returns object.
   * Options:
   *   id {Number} optional
   *   limit {Number} optional
   */
  unrated: function (req, res, next) {
    var user = req.user,
        limit = parseInt(req.query.limit) || 0;
    Beer.findUnrated(user, { limit: limit }, function (err, beers) {
      if (err) return api.serverError(req, res, err.message);
      api.ok(req, res, beers);
    });
  },

  /**
   * Return beers that have been rated by the specified
   * user id; if no id is specified, assumes current
   * user. If limit is 1, returns object.
   * Options:
   *   id {Number} optional
   *   limit {Number} optional
   */
  rated: function (req, res, next) {
    var user = req.user,
        limit = parseInt(req.query.limit) || 0;
    Beer.findRated(user, { limit: limit }, function (err, beers) {
      if (err) return api.serverError(req, res, err.message);
      api.ok(req, res, beers);
    });
  },

  /**
   * Return beers listed in current user's todo list
   */
  todo: function (req, res, next) {
    var user = req.user,
        limit = parseInt(req.query.limit) || 0;
    Beer.findTodo(user, { limit: limit }, function (err, beers) {
      if (err) return api.serverError(req, res, err.message);
      api.ok(req, res, beers);
    });
  },

  /**
   * Return beers skipped by current user.
   */
  skipped: function (req, res, next) {
    var user = req.user,
        limit = parseInt(req.query.limit) || 0;
    Beer.findSkipped(user, { limit: limit }, function (err, beers) {
      if (err) return api.serverError(req, res, err.message);
      api.ok(req, res, beers);
    });
  },

  /**
   * Return a beer by id.
   */
  read: function (req, res, next) {
    Beer.findById(req.params.id, function (err, beer) {
        if (err) return api.serverError(req, res);
        if (!beer) return api.notFound(req, res);
        api.ok(req, res, beer);
      });
  },

  /**
   * Create a beer. May pass image file with name "beer[image]".
   * Options:
   *   beer {Object} required
   *     name {String} required
   *     brewery {String} required
   *     description {String} optional
   *     abv {Number} optional
   *     image {filedata} optional
   */
  create: function (req, res, next) {
    var beer = new Beer(req.body.beer);
    beer.validate(function (err) {
      if (err) return api.invalid(req, res, beer.errors);
      var saveHandler = function saveHandler(err, beer) {
        if (err) return api.serverError(req, res, err.message);
        api.ok(req, res, beer);
      };
      if (req.files.beer && req.files.beer.image) {
        beer.attach('image', req.files.beer.image, function (err) {
          if (err) return api.serverError(req, res, "Unable to save image");
          beer.save(saveHandler);
        });
      }
      else {
        beer.save(saveHandler);
      }
    });
  },

  /**
   * Rate a beer for the current user. If a rating exists,
   * updates it; otherwise, creates a new one.
   * Options:
   *   rating {Number} required
   */
  rate: function (req, res, next) {
    var beerId = req.params.id,
        user = req.user,
        rating = parseInt(req.body.rating);
    Beer.findById(beerId, function (err, beer) {
      if (err) return api.serverError(req, res, err.message);
      if (!beer) return api.notFound(req, res);
      beer.rate(user, rating, function (err, beer) {
        if (err) return api.serverError(req, res, err.message);
        beer.removeTodo(user, function (err, beer) {
          if (err) return api.serverError(req, res, err.message);
          api.ok(req, res, beer);
        });
      });
    });
  },

  /**
   * Remove a beer's rating for the current user.
   */
  removeRating: function (req, res, next) {
    var beerId = req.params.id,
        user = req.user;
    Beer.findById(beerId, function (err, beer) {
      if (err) return api.serverError(req, res, err.message);
      if (!beer) return api.notFound(req, res);
      beer.removeRating(user, function (err, beer) {
        if (err) return api.serverError(req, res, err.message);
        api.ok(req, res, beer);
      });
    });
  },

  /**
   * Add a beer to the current user's todo list
   */
  addTodo: function (req, res, next) {
    var beerId = req.params.id,
        user = req.user;
    Beer.findById(beerId, function (err, beer) {
      if (err) return api.serverError(req, res, err.message);
      if (!beer) return api.notFound(req, res);
      beer.addTodo(user, function (err, beer) {
        if (err) return api.serverError(req, res, err.message);
        api.ok(req, res);
      });
    });
  },

  /**
   * Skip a beer for the current user
   */
  skip: function (req, res, next) {
    var beerId = req.params.id,
        user = req.user;
    Beer.findById(beerId, function (err, beer) {
      if (err) return api.serverError(req, res, err.message);
      if (!beer) return api.notFound(req, res);
      beer.skip(user, function (err, beer) {
        if (err) return api.serverError(req, res, err.message);
        api.ok(req, res);
      });
    });
  }
};

module.exports = function (app) {
  app.post('/api/beers', beers.create);
  app.get('/api/beers', beers.all);
  app.get('/api/beers/unrated', beers.unrated);
  app.get('/api/beers/rated', beers.rated);
  app.get('/api/beers/todo', beers.todo);
  app.get('/api/beers/skipped', beers.skipped);
  app.get('/api/beers/:id', beers.read);
  app.post('/api/beers/:id/ratings', beers.rate);
  app.post('/api/beers/:id/todos', beers.addTodo);
  app.post('/api/beers/:id/skips', beers.skip);
  app.delete('/api/beers/:id/ratings', beers.removeRating);
};