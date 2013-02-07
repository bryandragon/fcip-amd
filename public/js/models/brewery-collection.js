define(function (require) {
	var Backbone = require('backbone'),
			Brewery = require('models/brewery'),
			BreweryCollection;

	BreweryCollection = Backbone.Collection.extend({
		model: Brewery,
		url: '/api/breweries'
	});

	return BreweryCollection;
});