(function (root) {
  root.UnratedBeerCollection = Backbone.Collection.extend({
    model: Beer,
    url: '/api/beers/unrated',

    // Fetch a single unrated beer and add it to this collection
    fetchNext: function (options) {
      options || (options = {});
      var success = options.success, that = this;
      options.success = function (resp) {
        var beer = null;
        if (resp.length) {
          beer = new Beer(resp[0]);
          that.add(beer);
        }
        if (success) success(beer, resp, options);
      };
      options.url = this.url + '?limit=1'
      return this.sync('read', this, options);
    }
  });
})(this);