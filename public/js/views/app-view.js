define(function (require) {
	var $ = require('jquery'),
			_ = require('underscore'),
			Backbone = require('backbone'),
			markup = require('text!tpl/app-view.html'),
			AppView;

	AppView = Backbone.View.extend({
		template: _.template(markup),
		events: {
			'click a[data-state]': 'navigate'
		},

		initialize: function () {
			_.bindAll(this, 'render', 'navigate', '_setState');
		},

		render: function () {
			this.$el.html(this.template({}));
			this.$nav = this.$el.find('.nav');
			this.$content = this.$el.find('.content');
			return this;
		},

		navigate: function (event) {
			var link = $(event.target);
			this._updateNav(link.attr('data-state'));
			Backbone.history.navigate(link.attr('href'), {replace:true, trigger:true});
			return false;
		},

		setState: function (state) {
			var that = this;
			this.$content.fadeOut(200, function () {
				that._setState(state);
			});
			return this;
		},

		_setState: function (state) {
			if (this.currentView) {
				this.currentView.undelegateEvents();
				this.currentView.remove();
			}

			this._updateNav(state);

			switch (state) {
				case AppView.State.RATE:
					var RatingView = require('views/rating-view');
					this.currentView = new RatingView();
					this.$content.html(this.currentView.render().el);
					break;

				case AppView.State.RATED:
					var RatedView = require('views/rated-view');
					this.currentView = new RatedView();
					this.$content.html(this.currentView.render().el);
					break;

				case AppView.State.TODO:
					var TodoView = require('views/todo-view');
					this.currentView = new TodoView();
					this.$content.html(this.currentView.render().el);
					break;

				case AppView.State.SKIPPED:
					var SkippedView = require('views/skipped-view');
					this.currentView = new SkippedView();
					this.$content.html(this.currentView.render().el);
					break;

				default:
					var notFoundMarkup = require('text!tpl/404.html');
					this.$content.html(notFoundMarkup);
					break;
			}

			this.$content.fadeIn(200);
		},

		_updateNav: function (state) {
			this.$nav.find('.active').removeClass('active');
			if (state) {
				this.$nav.find('[data-state='+state+']').closest('li').addClass('active');
			}
		}
	}, {
		State: {
			RATE: 'rate',
			RATED: 'rated',
			TODO: 'todo',
			SKIPPED: 'skipped'
		}
	});

	return AppView;
});