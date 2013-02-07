(function (root) {
	root.StarsView = Backbone.View.extend({
		className: 'stars',
		events: {
			'click .star': 'rate',
			'click .add-todo': 'addTodo',
			'click .skip': 'skip'
		},

		initialize: function () {
			_.bindAll(this, 'render', 'disable', 'rate', 'addTodo', 'skip');
			this.template = _.template($('#stars-view-tpl').html());
			this.model.on('change:rating', this.render);
		},

		render: function () {
			var rating = this.model.get('rating');
			this.$el.html(this.template({ beer: this.model }));
			return this;
		},

		rate: function (event) {
			var button = $(event.target),
					rating = parseInt(button.attr('data-rating'));
			this.disable();
			this.model.rate(rating);
		},

		addTodo: function (event) {
			this.disable();
			this.model.addTodo();
		},

		skip: function (event) {
			this.disable();
			this.model.skip();
		},

		disable: function () {
			this.$el.find('.btn').attr('disabled', 'disabled');
		}
	});
})(this);