define(function (require) {
	var Backbone = require('backbone'),
			Beer = require('models/beer'),
			BeerCollection;

	BeerCollection = Backbone.Collection.extend({
		model: Beer,
		url: '/api/beers'
	});

	return BeerCollection;
});