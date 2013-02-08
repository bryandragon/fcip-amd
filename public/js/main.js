require.config({
	baseUrl: '/js',
	paths: {
		'jquery': 'libs/jquery/jquery.min',
		'underscore': 'libs/underscore/underscore.min',
		'backbone': 'libs/backbone/backbone.min',
		'bootstrap-transition': 'libs/bootstrap/transition',
		'bootstrap-modal': 'libs/bootstrap/modal',
		'text': 'libs/plugins/text',
		'almond': 'libs/almond/almond',
		'tpl': '../tpl'
	},
	deps: ['jquery'],
	shim: {
		'bootstrap-transition': {
			deps: ['jquery'],
			exports: 'jQuery.fn.transition'
		},
		'bootstrap-modal': {
			deps: ['jquery', 'bootstrap-transition'],
			exports: 'jQuery.fn.modal'
		},
		'underscore': {
			deps: ['jquery'],
			exports: '_'
		},
		'backbone': {
			deps: ['jquery', 'underscore'],
			exports: 'Backbone',
			init: function ($, _) {
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
				return Backbone.noConflict();
			}
		}
	}
});

require(['routers/app-router'], function (AppRouter) {
	var router = new AppRouter({ container: '#app' });
});