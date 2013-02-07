(function (root) {
  root.RatedBeerCollection = Backbone.Collection.extend({
    model: Beer,
    url: '/api/beers/rated',

    initialize: function () {
      var that = this;
      // When a beer rating is removed, remove the beer from the collection
      that.on('change:rating', function (beer) {
        if (!beer.get('rating')) {
          that.remove(beer);
        }
      });
    }
  });
})(this);