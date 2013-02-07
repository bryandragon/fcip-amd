(function (root) {
	root.BeerThumbnailView = Backbone.View.extend({
		tagName: 'li',
		className: 'span3',
		events: {
			'click .remove-rating': 'removeRating'
		},

		initialize: function () {
			_.bindAll(this, 'render', 'removeRating');
			this.template = _.template($('#beer-thumbnail-view-tpl').html());
		},

		render: function () {
			this.$el.html(this.template({ beer: this.model }));
			this.starsView = new StarsView({ el: this.$el.find('.stars'), model: this.model });
			this.starsView.render();
			return this;
		},

		close: function () {
			this.trigger('close');
			this.undelegateEvents();
			this.off();
			this.remove();
		},

		removeRating: function (event) {
			var that = this;
			that.$el.delay(150).fadeOut(150, function () {
				that.model.removeRating();
			});
		}
	});
})(this);