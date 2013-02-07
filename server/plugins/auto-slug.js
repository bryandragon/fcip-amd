var _ = require('underscore');

module.exports = function (schema, options) {
  schema.pre('save', function (next) {
    if (!this.slug || this.slug === '') {
      var slug = this.name.toLowerCase();
      slug = slug.replace(/[^-a-z0-9\s]+/g, '');
      slug = slug.replace(/\s+/g, '-');
      this.slug = slug;
    }
    next();
  });
};

