var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    findOrCreate = require('../plugins/find-or-create'),
    timestamps = require('../plugins/timestamps'),
    UserSchema;

UserSchema = mongoose.Schema({
  username: {type:String, require:true},
  email: String,
  oauthProvider: String,
  oauthAccessToken: String
});

UserSchema.plugin(timestamps);

UserSchema.plugin(findOrCreate);

UserSchema.statics.rated = function (user, done) {
  this.model('Beer').findRated(this, done);
};

UserSchema.statics.todoList = function (user, done) {
  this.model('Beer').findTodo(this, done);
};

UserSchema.methods.rated = function (done) {
  this.model('User').rated(this, done);
};

UserSchema.methods.todoList = function (done) {
  this.model('User').todoList(this, done);
};

UserSchema.methods.rate = function (beer, rating, done) {
  var that = this;
  beer.rate(that, rating, function (err, beer) {
    if (err) return done(err);
    done(null, that);
  });
};

UserSchema.methods.addTodo = function (beer, done) {
  var that = this;
  beer.addTodo(that, function (err, beer) {
    if (err) return done(err);
    done(null, that);
  });
};

UserSchema.methods.removeTodo = function (beer, done) {
  var that = this;
  beer.removeTodo(that, function (err, beer) {
    if (err) return done(err);
    done(null, that);
  });
};

UserSchema.post('remove', function (user) {
  user.model('Beer').removeRatings(user, function (err, result) {
    if (err) return console.log(err.message);
    user.model('Beer').removeTodos(user, function (err) {
      if (err) return console.log(err.message);
      user.model('Beer').removeSkips(user, function (err) {
        if (err) return console.log(err.message);
      });
    });
  });
});

module.exports = mongoose.model('User', UserSchema);
