define(function (require) {
	var Backbone = require('backbone'),
			Brewery;

	Brewery = Backbone.Model.extend({
		idAttribute: '_id'
	});

	return Brewery;
});