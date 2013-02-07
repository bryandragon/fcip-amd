(function (root) {
  root.TodoBeerCollection = Backbone.Collection.extend({
    model: Beer,
    url: '/api/beers/todo',

    initialize: function () {
      var that = this;
      // When a beer is no longer a todo, remove it from the collection
      that.on('change:todo', function (beer) {
        if (!beer.get('todo')) {
          that.remove(beer);
        }
      });
    },

    _prepareModel: function () {
      var model = Backbone.Collection.prototype._prepareModel.apply(this, arguments);
      if (model) {
        model.set({ todo: true });
      }
      return model;
    }
  });
})(this);