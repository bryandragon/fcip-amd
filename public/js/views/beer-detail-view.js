(function (root) {
	root.BeerDetailView = Backbone.View.extend({
		className: 'beer',
		events: {
			'click .next': 'close'
		},

		initialize: function () {
			_.bindAll(this, 'render', 'close', '_showNextButton');
			this.template = _.template($('#beer-detail-view-tpl').html());
			this.model.on('change:rating', this._showNextButton);
			this.model.on('change:todo change:skipped', this.close);
		},

		render: function () {
			this.$el.html(this.template({ beer: this.model }));
			this.stars = new StarsView({ el: this.$el.find('.stars'), model: this.model });
			this.stars.render();
			return this;
		},

		close: function (event) {
			this.trigger('close');
			this.undelegateEvents();
			this.off();
			this.remove();
		},

		_showNextButton: function () {
			if (this.model.get('rating')) {
				this.$el.find('.next').show();
			}
		}
	});
})(this);