(function (root) {
  root.RatingView = Backbone.View.extend({
    id: 'rating-view',

    initialize: function () {
      _.bindAll(this, 'render', 'next');
      this.template = _.template($('#rating-view-tpl').html());
      this.currentView = null;
      this.render();
      this.next();
    },

    render: function () {
      if (this._rendered) return this;
      this.$el.html(this.template({}));
      this._rendered = true;
      return this;
    },

    next: function () {
      var that = this;
      app.fetchUnratedBeer(function (beer) {
        var view = new BeerDetailView({ model: beer });
        view.on('close', function () {
          that.$el.fadeOut(150, function () {
            that.next();
          });
        });
        that.currentView = view;
        that.$el.html(view.render().el).fadeIn(150);
      });
    }
  });
})(this);