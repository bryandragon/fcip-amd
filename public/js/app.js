(function (root) {
	var App = Backbone.Model.extend({
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

	// Customize Backbone.sync for API
	var oldSync = Backbone.sync;
	Backbone.sync = function (method, model, options) {
		var success, error, xhr;
		options || (options = {});
		success = options.success;
		error = options.error;
		options.success = function (res) {
			if (res.status === 200) {
				if (success) success(res.data);
			}
			else {
				if (error) error(res.error);
			}
		};
		xhr = oldSync(method, model, options);
	};

	root.app = new App();

	$(function () {
		// Load templates
		$.ajax({
			type: 'GET',
			url: '/tpl/templates.html',
			dataType: 'html',
			success: function (templates) {
				// Append templates to DOM
				$('head').append(templates);
				// Start the app
				var router = new AppRouter({ container: '#app' });
			}
		});
	});
})(this);