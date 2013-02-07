var api = require('../api'),
    Brewery = require('../models/brewery'),
    breweries;

breweries = {
  list: function (req, res, next) {
    Brewery.find({}, function (err, breweries) {
      if (err) {
        return api.serverError(req, res, err.message);
      }
      api.ok(req, res, breweries);
    });
  },

  show: function (req, res, next) {
    Brewery.findOne({slug: req.params.slug}, function (err, brewery) {
      if (err) {
        return api.notFound(req, res, err.message);
      }
      api.ok(req, res, brewery);
    });
  }
};

module.exports = function (app) {
  app.get('/api/breweries', breweries.list);
  app.get('/api/breweries/:slug', breweries.show);
};