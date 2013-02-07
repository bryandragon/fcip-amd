var http = require('http'),
    path = require('path'),
    express = require('express'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    ejs = require('ejs'),
    config = require('../config'),
    auth = require('./routes/auth'),
    breweries = require('./routes/breweries'),
    beers = require('./routes/beers'),
    bootstrap = require('./bootstrap'),
    app;

mongoose.connect('mongodb://localhost/fcip');
mongoose.connection.on('err', function () {
  console.error('MongoDB: Connection error');
});
mongoose.connection.once('open', function () {
  console.log('MongoDB: Connected');
  bootstrap(function (err) {
    if (err) console.log(require('util').inspect(err));
  });
});

app = express();
app.configure(function () {
  app.engine('html', ejs.__express);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'html');
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.cookieSecret));
  app.use(express.session());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

app.get("*", function (req, res, next) {
  app.locals.title = config.title || "";
  app.locals.message = null;
  app.locals.NODE_ENV = process.env.NODE_ENV;
  next();
});

auth(app);
breweries(app);
beers(app);

app.get('/*', function (req, res, next) {
  res.render('index');
});

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});