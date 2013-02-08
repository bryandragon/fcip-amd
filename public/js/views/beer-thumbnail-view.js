define(function (require) {
	var _ = require('underscore'),
			Backbone = require('backbone'),
			StarsView = require('views/stars-view'),
			Beer = require('models/beer'),
			markup = require('text!tpl/beer-thumbnail-view.html'),
			BeerThumbnailView;

	BeerThumbnailView = Backbone.View.extend({
		tagName: 'li',
		className: 'span3',
		template: _.template(markup),
		events: {
			'click .remove-rating': 'removeRating'
		},

		initialize: function () {
			_.bindAll(this, 'render', 'removeRating');
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

	return BeerThumbnailView;
});