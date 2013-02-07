var path          = require('path'),
    util          = require('util'),
    mongoose      = require('mongoose'),
    ObjectId      = mongoose.Schema.Types.ObjectId,
    attachments   = require('mongoose-attachments'),
    fsAttachments = require('mongoose-attachments-localfs'),
    autoSlug      = require('../plugins/auto-slug'),
    timestamps    = require('../plugins/timestamps'),
    BeerSchema,
    Beer;

BeerSchema = mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  brewery: { type: ObjectId, ref: 'Brewery', required: true },
  slug:        { type: String, trim: true },
  style:       { type: String, required: true, trim: true },
  description: { type: String },
  abv:         { type: Number, min: 0 },
  ibu:         { type: Number, min: 0 },
  ratings: [
    { user: ObjectId, rating: Number, createdAt: Date }
  ],
  averageRating: { type: Number, default: 0 },
  ratingsCount:  { type: Number, default: 0 },
  todos: [
    { user: ObjectId, createdAt: Date }
  ],
  todosCount: { type: Number, default: 0 },
  skips: [
    { user: ObjectId, createdAt: Date }
  ],
  skipsCount: { type: Number, default: 0 },
  random:     { type: Number, default: 0 }
});

// Automatically create slug when saving if not specified
BeerSchema.plugin(autoSlug);

// Include getters and virtuals in generated JSON
BeerSchema.set('toJSON', { getters: true });

// Set up image attachments for beers
BeerSchema.plugin(attachments, {
  directory: path.join(__dirname, '../../public/uploads'),
  storage: {
    providerName: 'localfs'
  },
  properties: {
    image: {
      styles: {
        original: {},
        icon: { thumbnail: '32x32^', gravity: 'center', extent: '32x32' },
        thumb: { resize: '160x160>' },
        small: { resize: '260x260>' },
        detail: { resize: '360x360>' }
      }
    }
  }
});

BeerSchema.virtual('imageIconURL').get(function () {
  return path.join('/uploads/icon', path.basename(this.image.icon.path));
});

BeerSchema.virtual('imageThumbnailURL').get(function () {
  return path.join('/uploads/thumb', path.basename(this.image.thumb.path));
});

BeerSchema.virtual('imageSmallURL').get(function () {
  return path.join('/uploads/small', path.basename(this.image.small.path));
});

BeerSchema.virtual('imageDetailURL').get(function () {
  return path.join('/uploads/detail', path.basename(this.image.detail.path));
});

BeerSchema.virtual('breweryName').get(function () {
  return this.brewery.name;
});

/**
 * The current user's rating for this beer.
 * Since we are always querying in the context of the current
 * user, we can assume that the first and only rating sub-doc
 * belongs to the current user.
 */
BeerSchema.virtual('rating').get(function () {
  if (this.ratings && this.ratings.length) {
    return this.ratings[0].rating;
  }
  return 0;
});

// Validate uniqueness of name
BeerSchema.pre('validate', function (next) {
  var that = this;
  that.model('Beer').count(
    { name: that.name, _id: { $ne: that._id } },
    function (err, count) {
      if (err) return next(err);
      if (count > 0) {
        that.invalidate('name', "Name taken");
      }
      next();
    });
});

// Assign a random value on save to allow for randomization in queries
BeerSchema.pre('save', function (next) {
  this.random = Math.random();
  next();
});

/**
 * Find unrated, non-todo beers in random order for a given user.
 * Options: limit
 */
BeerSchema.statics.findUnrated = function (user, options, done) {
  if (!done) {
    done = options;
    options = {};
  }
  options || (options = {});
  var rand = Math.random(),
      order = (Math.random() < 0.5) ? -1 : 1,
      query = this.find();
  if (options.limit) {
    query.limit(options.limit);
  }
  query.find({
    '$and': [
      {
        '$or': [
          { 'ratingsCount': 0 },
          { 'ratings.user': { '$ne': user._id } }
        ]
      },
      {
        '$or': [
          { 'todosCount': 0 },
          { 'todos.user': { '$ne': user._id } }
        ]
      },
      {
        '$or': [
          { 'skipsCount': 0 },
          { 'skips.user': { '$ne': user._id } }
        ]
      }
    ]
  });
  query.populate('brewery');
  query.select('-ratings -todos -skips');
  query.sort({ random: order });
  query.exec(function (err, beers) {
    if (err) return done(err);
    done(null, beers || []);
  });
};

/**
 * Find unrated beers for the given user.
 * Options: limit
 */
BeerSchema.statics.findRated = function (user, options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }
  options || (options = {});
  var query = this.find().where('ratings.user').equals(user._id);
  if (options.limit) {
    query.limit(options.limit);
  }
  query.populate('brewery');
  query.select('-todos -skips');
  query.sort('-ratings.rating name');
  query.exec(callback);
};

/**
 * Find all beers in a given user's TODO list.
 * Options: limit
 */
BeerSchema.statics.findTodo = function (user, options, done) {
  if (!done) {
    done = options;
    options = {};
  }
  options || (options = {});
  var query = this.find().where('todos.user').equals(user._id);
  if (options.limit) {
    query.limit(options.limit);
  }
  query.populate('brewery');
  query.select('-ratings -todos -skips');
  query.exec(done);
};

/**
 * Find all beers skipped by a given user.
 * Options: limit
 */
BeerSchema.statics.findSkipped = function (user, options, done) {
  if (!done) {
    done = options;
    options = {};
  }
  options || (options = {});
  var query = this.find().where('skips.user').equals(user._id);
  if (options.limit) {
    query.limit(options.limit);
  }
  query.populate('brewery');
  query.select('-ratings -todos -skips');
  query.exec(done);
};

/**
 * Remove all ratings for a given user.
 */
BeerSchema.statics.removeRatings = function (user, done) {
  // TODO: update averageRating
  this.model('Beer').update(
    { 'ratings.user': user._id },
    { $pull: { ratings: { user: user._id } }, $inc: { ratingsCount: -1 } },
    { multi: true },
    function (err, result) {
      if (err) return done(err);
      done(null, result);
    });
};

/**
 * Remove all todos for a given user.
 */
BeerSchema.statics.removeTodos = function (user, done) {
  this.model('Beer').update(
    { 'todos.user': user._id },
    { $pull: { todos: { user: user._id } }, $inc: { todosCount: -1 } },
    { multi: true },
    function (err, result) {
      if (err) return done(err);
      done(null, result);
    });
};

/**
 * Remove all skips for a given user.
 */
BeerSchema.statics.removeSkips = function (user, done) {
  this.model('Beer').update(
    { 'skips.user': user._id },
    { $pull: { skips: { user: user._id } }, $inc: { skipsCount: -1 } },
    { multi: true },
    function (err, result) {
      if (err) return done(err);
      done(err, result);
    });
};

/**
 * Rate this beer for a given user. If the user
 * has already rated this beer, updates his rating;
 * otherwise, inserts a new rating for the user.
 */
BeerSchema.methods.rate = function (user, rating, done) {
  var that = this;
  that.model('Beer').findOne({ _id: that._id, 'ratings.user': user._id }, function (err, count) {
    if (err) return done(err);
    if (count) {
      that.model('Beer').update(
        { _id: that._id, 'ratings.user': user._id },
        { 'ratings.$.rating': rating },
        function (err, result) {
          if (err) return done(err);
          if (!result) return done(new Error("Unable to save rating"));
          that.refreshRatingTally(done);
        });
    }
    else {
      that.ratings.addToSet({ user: user._id, rating: rating, createdAt: new Date() });
      that.save(function (err, beer) {
        if (err) return done(err);
        that.removeTodo(user, function (err) {
          if (err) return done(err);
          that.unskip(user, function (err) {
            if (err) return done(err);
            that.refreshRatingTally(done);
          })
        });
      });
    }
  });
};

/**
 * Remove beer rating for a given user.
 */
BeerSchema.methods.removeRating = function (user, done) {
  var that = this;
  that.model('Beer').update(
    { _id: that._id, 'ratings.user': user._id },
    { $unset: { ratings: { user: user._id } } },
    function (err, result) {
      if (err) return done(err);
      if (!result) return done(null, that);
      that.refreshRatingTally(done);
    });
};

/**
 * Update cached ratings average and count for a beer.
 */
BeerSchema.methods.refreshRatingTally = function (done) {
  var that = this;
  that.model('Beer').aggregate(
    { $match: { _id: that._id } },
    { $project: { ratings: 1 } },
    { $unwind: '$ratings' },
    { $group: { _id: '$_id', avg: { $avg: '$ratings.rating' }, count: { $sum: 1 } } },
    function (err, result) {
      if (err) return done(err);
      var avg = 0, count = 0;
      if (result && result.length) {
        avg = result[0].avg;
        count = result[0].count;
      }
      that.update({ ratingsCount: count, averageRating: avg }, function (err, result) {
        if (err) return done(err);
        if (!result) return done(null, that);
        that.model('Beer').findById(that._id, done);
      });
    });
};

/**
 * Add a beer to a given user's todo list.
 */
BeerSchema.methods.addTodo = function (user, done) {
  var that = this;
  that.model('Beer').count({ _id: that._id, 'todos.user': user._id }, function (err, count) {
    if (err) return done(err);
    if (count) return done(null, that);
    that.todos.addToSet({ user: user._id, createdAt: new Date() });
    that.save(function (err, beer) {
      if (err) return done(err);
      that.removeRating(user, function (err) {
        if (err) return done(err);
          that.unskip(user, function (err) {
          if (err) return done(err);
          that.refreshTodoTally(done);
        });
      });
    });
  });
};

/**
 * Remove a beer from a given user's todo list.
 */
BeerSchema.methods.removeTodo = function (user, done) {
  var that = this;
  that.model('Beer').update(
    { _id: that._id, 'todos.user': user._id },
    { $unset: { todos: { user: user._id } } },
    function (err, result) {
      if (err) return done(err);
      if (!result) return done(null, that);
      that.refreshTodoTally(done);
    });
};

/**
 *
 */


/**
 * Update cached todos count for a beer.
 */
BeerSchema.methods.refreshTodoTally = function (done) {
  var that = this;
  that.model('Beer').aggregate(
    { $match: { _id: that._id } },
    { $project: { todos: 1 } },
    { $unwind: '$todos' },
    { $group: { _id: '$_id', count: { $sum: 1 } } },
    function (err, result) {
      if (err) return done(err);
      var count = (result && result.length) ? result[0].count : 0;
      that.update({ todosCount: count }, function (err, result) {
        if (err) return done(err);
        if (!result) return done(null, that);
        that.model('Beer').findById(that._id, done);
      });
    });
};

/**
 * Skip a beer for the given user.
 */
BeerSchema.methods.skip = function (user, done) {
  var that = this;
  that.model('Beer').count({ _id: that._id, 'skips.user': user._id }, function (err, count) {
    if (err) return done(err);
    if (count) return done(null, that);
    that.skips.addToSet({ user: user._id, createdAt: new Date() });
    that.save(function (err, beer) {
      if (err) return done(err);
      that.removeRating(user, function (err) {
        if (err) return done(err);
        that.removeTodo(user, function (err) {
          if (err) return done(err);
          that.refreshSkipTally(done);
        });
      });
    });
  });
};

/**
 * Unskip a beer for a given user.
 */
BeerSchema.methods.unskip = function (user, done) {
  var that = this;
  that.model('Beer').update(
    { _id: that._id, 'skips.user': user._id },
    { $unset: { skips: { user: user._id } } },
    function (err, result) {
      if (err) return done(err);
      if (!result) return done(null, that);
      that.refreshSkipTally(done);
    });
};

/**
 * Update cached skips count for a beer.
 */
BeerSchema.methods.refreshSkipTally = function (done) {
  var that = this;
  that.model('Beer').aggregate(
    { $match: { _id: that._id } },
    { $project: { skips: 1 } },
    { $unwind: '$skips' },
    { $group: { _id: '$_id', count: { $sum: 1 } } },
    function (err, result) {
      if (err) return done(err);
      var count = (result && result.length) ? result[0].count : 0;
      that.update({ skipsCount: count }, function (err, result) {
        if (err) return done(err);
        if (!result) return done(null, that);
        that.model('Beer').findById(that._id, done);
      });
    });
};

module.exports = Beer = mongoose.model('Beer', BeerSchema);
