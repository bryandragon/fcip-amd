define(function (require) {
  var BeerListView = require('views/beer-list-view'),
      TodoBeerCollection = require('models/todo-beer-collection'),
      TodoView;

  TodoView = BeerListView.extend({
    id: 'todo-view',

    initialize: function () {
      this.collection = new TodoBeerCollection();
      this.title = "Todo List";
      this.emptyMessage = "Your Todo List is empty. Time to <a href=\"/rate\" data-state=\"rate\">get to work</a>...";
      BeerListView.prototype.initialize.apply(this, arguments);
    }
  });

  return TodoView;
});