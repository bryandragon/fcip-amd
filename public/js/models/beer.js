(function (root) {
	root.Beer = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			todo: false,
			skipped: false,
			rating: 0
		},

		rate: function (rating) {
			var that = this;
			$.ajax({
				type: 'POST',
				url: '/api/beers/' + that.id + '/ratings',
				data: { rating: rating },
				dataType: 'json',
				success: function (data) {
					if (data.status === 200) {
						that.set({ rating: rating, todo: false, skipped: false });
					}
					else {
						console.log("Error rating beer");
					}
				},
				error: function (xhr, status, err) {
					console.log("AJAX ERROR: " + status + ", " + err.message);
				}
			})
		},

		removeRating: function () {
			var that = this;
			$.ajax({
				type: 'POST',
				url: '/api/beers/' + that.id + '/ratings',
				data: { _method: 'DELETE' },
				dataType: 'json',
				success: function (data) {
					if (data.status === 200) {
						that.set({ rating: 0 });
					}
					else {
						console.log("Error removing beer rating");
					}
				},
				error: function (xhr, status, err) {
					console.log("AJAX ERROR: " + status + ", " + err.message);
				}
			})
		},

		addTodo: function () {
			var that = this;
			$.ajax({
				type: 'POST',
				url: '/api/beers/' + that.id + '/todos',
				dataType: 'json',
				success: function (data) {
					if (data.status === 200) {
						that.set({ todo: true, skipped: false });
					}
					else {
						console.log("Error adding todo");
					}
				},
				error: function (xhr, status, err) {
					console.log("AJAX ERROR: " + status + ", " + err.message);
				}
			});
		},

		skip: function () {
			var that = this;
			$.ajax({
				type: 'POST',
				url: '/api/beers/' + that.id + '/skips',
				dataType: 'json',
				success: function (data) {
					if (data.status === 200) {
						that.set({ skipped: true, todo: false });
					}
					else {
						console.log("Error adding skip");
					}
				},
				error: function (xhr, status, err) {
					console.log("AJAX ERROR: " + status + ", " + err.message);
				}
			});
		}
	});
})(this);