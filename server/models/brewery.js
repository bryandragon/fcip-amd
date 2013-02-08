var path = require('path'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.ObjectId,
    attachments = require('mongoose-attachments'),
    autoSlug = require('../plugins/auto-slug'),
    timestamps = require('../plugins/timestamps'),
    BrewerySchema;

BrewerySchema = mongoose.Schema({
  name: {type: String, required: true, trim: true},
  slug: {type: String, trim: true},
  address: {
    street1: {type:String, trim:true},
    street2: {type:String, trim:true},
    city: {type:String, trim: true},
    state: {type:String, trim:true},
    zip: {type:String, trim:true}
  },
  phone: {type:String, trim:true},
  website: {type:String, trim:true},
  beers: [{type:ObjectId, ref:'Beer'}]
});

// Include getters and virtuals in generated JSON
BrewerySchema.set('toJSON', {getters:true});

// Manages createdAt and updatedAt fields for us
BrewerySchema.plugin(timestamps);

// Automatically create slug when saving if not specified
BrewerySchema.plugin(autoSlug);

module.exports = mongoose.model('Brewery', BrewerySchema);
