var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    Brewery = require('./models/brewery'),
    Beer = require('./models/beer');

module.exports = function (done) {
  Brewery.count({}, function (err, count) {
    if (err) return done(err);
    // Breweries have been loaded, so just return
    if (count) return done(null);
    // Load brewery data
    fs.readFile(path.join(__dirname, 'data/breweries.json'), function (err, raw) {
      if (err) return done(err);
      var breweries = JSON.parse(raw);
      // Sequentially create each brewery and load its beers
      async.forEachSeries(
        breweries,
        function (brewery, nextBrewery) {
          Brewery.create(brewery, function (err, brewery) {
            if (err) return nextBrewery(err);
            // Load beer data
            fs.readFile(path.join(__dirname, 'data/beers', brewery.slug + '.json'), function (err, raw) {
                // We don't care if the json file doesn't exist for the brewery
                if (err) return nextBrewery(null);
                var beers = JSON.parse(raw);
                beers.map(function (beer) {
                  beer.brewery = brewery._id;
                });
                async.forEachSeries(beers, function (beer, nextBeer) {
                  Beer.create(beer, function (err, beer) {
                    if (err) return nextBeer(err);
                    var originalPath = path.join(__dirname, 'data/images', brewery.slug, beer.slug + '.png'),
                        copyPath = path.join('/tmp', beer.slug + '.png');
                    if (!fs.existsSync(originalPath)) return nextBeer();
                    var rs = fs.createReadStream(originalPath),
                        ws = fs.createWriteStream(copyPath);
                    rs.on('error', nextBeer);
                    ws.on('error', nextBeer);
                    ws.on('close', function (err) {
                      if (err) return nextBeer(err);
                      beer.attach('image', { path: copyPath }, function (err) {
                        if (err) return nextBeer(err);
                        beer.save(nextBeer);
                      });
                    });
                    rs.pipe(ws);
                  });
                }, function (err) {
                  nextBrewery(err);
                });
                
              });
          });
        },
        function (err, results) {
          done(err);
        });
    });
  });
};