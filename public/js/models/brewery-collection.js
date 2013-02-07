(function (root) {
	root.BreweryCollection = Backbone.Collection.extend({
		model: Brewery,
		url: '/api/breweries'
	});
})(this);