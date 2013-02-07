define(function (require) {
  var Backbone = require('backbone'),
      Beer = require('models/beer'),
      SkippedBeerCollection;

  SkippedBeerCollection = Backbone.Collection.extend({
    model: Beer,
    url: '/api/beers/skipped',

    initialize: function () {
      var that = this;
      // When a beer is unskipped, remove it from the collection
      that.on('change:skipped', function (beer) {
        if (!beer.get('skipped')) {
          that.remove(beer);
        }
      });
    },

    _prepareModel: function () {
      var model = Backbone.Collection.prototype._prepareModel.apply(this, arguments);
      if (model) {
        model.set({ skipped: true });
      }
      return model;
    }
  });

  return SkippedBeerCollection;
});