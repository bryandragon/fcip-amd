(function (root) {
  root.TodoView = BeerListView.extend({
    id: 'todo-view',

    initialize: function () {
      this.collection = new TodoBeerCollection();
      this.title = "Todo List";
      this.emptyMessage = "Your Todo List is empty. Time to <a href=\"/rate\" data-state=\"rate\">get to work</a>...";
      BeerListView.prototype.initialize.apply(this, arguments);
    }
  });
})(this);