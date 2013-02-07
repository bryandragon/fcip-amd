module.exports = function (schema, options) {
  schema.add({updatedAt: Date, createdAt: Date});
  schema.pre('save', function (next) {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    this.updatedAt = new Date();
    next();
  });

};