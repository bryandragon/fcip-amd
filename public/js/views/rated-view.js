define(function (require) {
  var BeerListView = require('views/beer-list-view'),
      RatedBeerCollection = require('models/rated-beer-collection'),
      RatedView;

  RatedView = BeerListView.extend({
    id: 'rated-view',

    initialize: function () {
      this.collection = new RatedBeerCollection();
      this.title = "Beer Shelf";
      this.emptyMessage = "You haven't rated any beers yet. Go <a href=\"/rate\" data-state=\"rate\">rate some</a>!";
      BeerListView.prototype.initialize.apply(this, arguments);
    }
  });

  return RatedView;
});