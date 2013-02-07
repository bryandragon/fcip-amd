(function (root) {
	root.AppView = Backbone.View.extend({
		events: {
			'click a[data-state]': 'navigate'
		},

		initialize: function () {
			_.bindAll(this, 'render', 'navigate', '_setState');
			this.template = _.template($('#app-view-tpl').html());
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
					this.currentView = new RatingView();
					this.$content.html(this.currentView.render().el);
					break;

				case AppView.State.RATED:
					this.currentView = new RatedView();
					this.$content.html(this.currentView.render().el);
					break;

				case AppView.State.TODO:
					this.currentView = new TodoView();
					this.$content.html(this.currentView.render().el);
					break;

				case AppView.State.SKIPPED:
					this.currentView = new SkippedView();
					this.$content.html(this.currentView.render().el);
					break;

				default:
					this.$content.html($('#404-tpl').html());
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
})(this);