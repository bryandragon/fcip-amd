(function (root) {
  root.RatedView = BeerListView.extend({
    id: 'rated-view',

    initialize: function () {
      this.collection = new RatedBeerCollection();
      this.title = "Beer Shelf";
      this.emptyMessage = "You haven't rated any beers yet. Go <a href=\"/rate\" data-state=\"rate\">rate some</a>!";
      BeerListView.prototype.initialize.apply(this, arguments);
    }
  });
})(this);