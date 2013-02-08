var _ = require('underscore');

module.exports = function (schema, options) {
  schema.statics.findOrCreate = function (findParams, createParams, callback) {
    var that = this;
    if (!callback) {
      callback = createParams;
      createParams = {};
    }
    that.findOne(findParams, function (err, obj) {
      if (err) return callback(err);
      if (obj) {
        return callback(null, obj);
      }
      that.create(_.extend(findParams, createParams), callback);
    });
  };
};