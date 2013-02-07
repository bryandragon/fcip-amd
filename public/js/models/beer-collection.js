(function (root) {
  root.BeerCollection = Backbone.Collection.extend({
    model: Beer,
    url: '/api/beers'
  });
})(this);