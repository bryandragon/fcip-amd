(function (root) {
  root.BeerListView = Backbone.View.extend({
    className: 'beer-list-view',

    initialize: function (options) {
      _.bindAll(this, 'render', 'addBeer', 'removeBeer');
      this.template = _.template($('#beer-list-view-tpl').html());
      if (this.collection) {
        this.collection.on('reset', this.render);
        this.collection.on('add', this.addBeer);
        this.collection.on('remove', this.removeBeer);
        this.collection.fetch();
      }
      this._views = {};
    },

    render: function () {
      var title = this.title || "",
          emptyMessage = this.emptyMessage || "No beers found.",
          html;
      html = this.template({ title: title, emptyMessage: emptyMessage, beers: this.collection });
      this.$el.html(html);
      this.$beerList = this.$el.find('.beers');
      this.addBeer(this.collection.toArray());
      return this;
    },

    addBeer: function (beers) {
      var that = this;
      that._views = {};
      that.$beerList.empty();
      beers = _.isArray(beers) ? beers : [beers];
      _.forEach(beers, function (beer) {
        var beerView = new BeerThumbnailView({ model: beer });
        that._views[beer.id] = beerView;
        that.$beerList.append(beerView.render().el);
      });
    },

    removeBeer: function (beers) {
      var that = this;
      beers = _.isArray(beers) ? beers : [beers];
      _.forEach(beers, function (beer) {
        var beerView = that._views[beer.id];
        if (!beerView) return;
        beerView.$el.delay(500).fadeOut(150, function () {
          beerView.close();
          delete that._views[beer.id];
        });
      });
      if (this.collection.length === 0) {
        this.render();
      }
    }
  });
})(this);