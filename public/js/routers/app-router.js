define(function (require) {
	var Backbone = require('backbone'),
			AppView = require('views/app-view'),
			AppRouter;

	AppRouter = Backbone.Router.extend({
		routes: {
			'': 'rate',
			'rate': 'rate',
			'rated': 'rated',
			'todo': 'todo',
			'skipped': 'skipped',
			':catchall': 'notFound'
		},

		initialize: function (options) {
			options || (options = {});
			this.appView = new AppView({ el: $(options.container) });
			this.appView.render();
			Backbone.history.start({ pushState: true });
		},

		rate: function () {
			this.appView.setState(AppView.State.RATE);
		},

		rated: function () {
			this.appView.setState(AppView.State.RATED);
		},

		todo: function () {
			this.appView.setState(AppView.State.TODO);
		},

		skipped: function () {
			this.appView.setState(AppView.State.SKIPPED);
		},

		notFound: function () {
			this.appView.setState(null);
		}
	});

	return AppRouter;
});