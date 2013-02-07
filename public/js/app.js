define(function (require) {
	var Backbone = require('backbone'),
			BreweryCollection = require('models/brewery-collection'),
			BeerCollection = require('models/beer-collection'),
			UnratedBeerCollection = require('models/unrated-beer-collection'),
			App, instance;

	App = Backbone.Model.extend({
		initialize: function () {
			var that = this;
			this.breweries = new BreweryCollection();
			this.breweries.on('reset', function () { that.trigger('load:breweries'); });
			this.beers = new BeerCollection();
			this.beers.on('reset', function () { that.trigger('load:beers'); });
			this.unrated = new UnratedBeerCollection();
		},

		fetchBreweries: function (callback) {
			if (this.breweries.length) return callback(this.breweries);
			this.breweries.fetch({ success: callback });
		},

		fetchBeers: function (callback) {
			if (this.beers.length) return callback(this.beers);
			this.beers.fetch({ success: callback });
		},

		fetchUnratedBeer: function (callback) {
			this.unrated.fetchNext({ success: callback });
		}
	});

	instance = new App();

	return instance;
});