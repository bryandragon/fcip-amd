(function (root) {
  root.SkippedView = BeerListView.extend({
    id: 'skipped-view',

    initialize: function () {
      this.collection = new SkippedBeerCollection();
      this.title = "Skipped Beers <small>Give 'em a second chance!</small>";
      this.emptyMessage = "You haven't skipped any beers yet. Way to drink.";
      BeerListView.prototype.initialize.apply(this, arguments);
    }
  });
})(this);