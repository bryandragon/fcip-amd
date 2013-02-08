var mongoose = require('mongoose'),
    Brewery = require('../server/models/brewery'),
    Beer = require('../server/models/beer'),
    User = require('../server/models/user'),
    util = require('util'),
    expect = require('chai').expect;

mongoose.connect('mongodb://localhost/fcip_test');

describe('Beer', function () {

  var brewery, user;

  function createBeer(done) {
    Brewery.findOne({ name: "New Belgium Brewing Company" },
      function (err, brewery) {
        Beer.create({
          name: "Fat Tire",
          brewery: brewery._id,
          style: "Ale",
          description: "The original."
        }, done);
      });
  }

  before(function (done) {
    Brewery.create({ name: "New Belgium Brewing Company" }, done);
  });

  beforeEach(function (done) {
    Brewery.findOne(function (err, b) {
      brewery = b
      Beer.create([
        { name: 'Beer 1', brewery: b, abv: 5, description: "Delicious.", style: "Wheat" },
        { name: 'Beer 2', brewery: b, abv: 6, description: "Good.", style: "Winter Lager" },
        { name: 'Beer 3', brewery: b, abv: 7, description: "Great.", style: "Pale Ale" },
        { name: 'Beer 4', brewery: b, abv: 8, description: "Wonderful.", style: "IPA" },
        { name: 'Beer 5', brewery: b, abv: 9, description: "Excellent.", style: "Double IPA" }
        ], function (err) {
          User.create({ username: 'henryj' }, function (err, u) {
            user = u;
            done();
          });
        });
    })
  });

  afterEach(function (done) {
    Beer.collection.remove(function () {
      User.collection.remove(done);
    });
  });

  it('should not save without a name', function (done) {
    Beer.create({}, function (err) {
      expect(err).to.exist;
      expect(err.errors.name).to.be.an('object');
      done();
    });
  });

  it('should require a unique name', function (done) {
    var props = { name: 'Beer 1', brewery: brewery, style: 'IPA' };
    Beer.create(props, function (err, beer) {
      Beer.create(props, function (err, beer) {
        expect(err).to.exist;
        expect(err.errors.name).to.be.an('object');
        expect(err.errors.name.type).to.equal('Name taken');
        done();
      });
    });
  });

  it('should not save without a brewery', function (done) {
    Beer.create({}, function (err) {
      expect(err).to.exist;
      expect(err.errors.brewery).to.be.an('object');
      done();
    });
  });

  it('should not save without a style', function (done) {
    Beer.create({}, function (err) {
      expect(err).to.exist;
      expect(err.errors.style).to.be.an('object');
      done();
    });
  });

  it('should save if valid', function (done) {
    createBeer(function (err, beer) {
      expect(err).to.not.exist;
      expect(beer).to.be.instanceOf(Beer);
      done();
    });
  });

  it('should initialize cached counts to 0', function (done) {
    createBeer(function (err, beer) {
      expect(beer.ratingsCount).to.equal(0);
      expect(beer.averageRating).to.equal(0);
      expect(beer.todosCount).to.equal(0);
      done();
    });
  });

  it('should store a random number when saving', function (done) {
    createBeer(function (err, beer) {
      expect(beer.random).to.be.a('number');
      done();
    });
  });

  describe('todos', function () {

    it('should add a todo and update the todos count', function (done) {
      createBeer(function (err, beer) {
        beer.addTodo(user, function (err, beer) {
          expect(err).to.not.exist;
          expect(beer).to.be.an.instanceOf(Beer);
          expect(beer.todosCount).to.equal(1);
          done();
        });
      });
    });

    it('should remove a todo and update the todos count', function (done) {
      createBeer(function (err, beer) {
        beer.addTodo(user, function (err, beer) {
          beer.removeTodo(user, function (err, beer) {
            expect(err).to.not.exist;
            expect(beer).to.be.an.instanceOf(Beer);
            expect(beer.todosCount).to.equal(0);
            done();
          });
        });
      });
    });

    it('should add a todo and remove any ratings', function (done) {
      Beer.findOne({ name: 'Beer 1' }, function (err, beer) {
        beer.rate(user, 3, function (err, beer) {
          beer.addTodo(user, function (err, beer) {
            expect(err).to.not.exist;
            expect(beer).to.be.an.instanceOf(Beer);
            expect(beer.ratings).to.have.length(0);
            expect(beer.ratingsCount).to.equal(0);
            done();
          });
        });
      });
    });

    it('should add a todo and remove any skips', function (done) {
      Beer.findOne({ name: 'Beer 1' }, function (err, beer) {
        beer.skip(user, function (err, beer) {
          beer.addTodo(user, function (err, beer) {
            expect(err).to.not.exist;
            expect(beer).to.be.an.instanceOf(Beer);
            expect(beer.skips).to.have.length(0);
            expect(beer.skipsCount).to.equal(0);
            done();
          });
        });
      });
    });

    it("should remove a user's todos when user is removed", function (done) {
      User.create({ username: 'henry' }, function (err, user) {
        Beer.find({ name: { $in: ['Beer 1', 'Beer 2'] } }, function (err, beers) {
          beers[0].addTodo(user, function (err, beer) {
            beers[1].addTodo(user, function (err, beer) {
              user.remove(function (err, user) {
                // User a timeout because Beer.removeTodos() is called post remove
                setTimeout(function () {
                  Beer.find({ name: { $in: ['Beer 1', 'Beer 2'] } },
                    function (err, beers) {
                      expect(beers[0].todos).to.have.length(0);
                      expect(beers[0].todosCount).to.equal(0);
                      expect(beers[1].todos).to.have.length(0);
                      expect(beers[1].todosCount).to.equal(0);
                      done();
                    });
                }, 100);
              });
            });
          });
        });
      });
    });

  });

  describe('ratings', function () {

    it('should add a rating and update the ratings average and ratings count', function (done) {
      createBeer(function (err, beer) {
        beer.rate(user, 3, function (err, beer) {
          expect(err).to.not.exist;
          expect(beer).to.be.an.instanceOf(Beer);
          expect(beer.ratingsCount).to.equal(1);
          expect(beer.averageRating).to.equal(3);
          done();
        });
      });
    });

    it('should update an existing rating for a user and update the ratings average', function (done) {
      createBeer(function (err, beer) {
        beer.rate(user, 3, function (err, beer) {
          beer.rate(user, 5, function (err, beer) {
            expect(err).to.not.exist;
            expect(beer).to.be.an.instanceOf(Beer);
            expect(beer.ratingsCount).to.equal(1);
            expect(beer.averageRating).to.equal(5);
            done();
          });
        });
      });
    });

    it('should add a rating and remove any todos', function (done) {
      Beer.findOne({ name: 'Beer 1' }, function (err, beer) {
        beer.addTodo(user, function (err, beer) {
          beer.rate(user, 3, function (err, beer) {
            expect(err).to.not.exist;
            expect(beer).to.be.an.instanceOf(Beer);
            expect(beer.todos).to.have.length(0);
            expect(beer.todosCount).to.equal(0);
            done();
          });
        });
      });
    });

    it('should add a rating and remove any skips', function (done) {
      Beer.findOne({ name: 'Beer 1' }, function (err, beer) {
        beer.skip(user, function (err, beer) {
          beer.rate(user, 3, function (err, beer) {
            expect(err).to.not.exist;
            expect(beer).to.be.an.instanceOf(Beer);
            expect(beer.skips).to.have.length(0);
            expect(beer.skipsCount).to.equal(0);
            done();
          });
        });
      });
    });

    it("should remove a user's ratings when the user is removed", function (done) {
      User.create({ username: 'henry' }, function (err, user) {
        Beer.find({ name: { $in: ['Beer 1', 'Beer 2'] } }, function (err, beers) {
          beers[0].rate(user, 3, function (err, beer) {
            beers[1].rate(user, 2, function (err, beer) {
              user.remove(function (err, user) {
                // User a timeout because Beer.removeRatings() is called post remove
                setTimeout(function () {
                  Beer.find({ name: { $in: ['Beer 1', 'Beer 2'] } },
                    function (err, beers) {
                      expect(beers[0].ratings).to.have.length(0);
                      expect(beers[1].ratings).to.have.length(0);
                      done();
                    });
                }, 100);
              });
            });
          });
        });
      });
    });

  });

  describe('skips', function () {

    it('should add a skip and update the skips count', function (done) {
      createBeer(function (err, beer) {
        beer.skip(user, function (err, beer) {
          expect(err).to.not.exist;
          expect(beer).to.be.an.instanceOf(Beer);
          expect(beer.skipsCount).to.equal(1);
          done();
        });
      });
    });

    it('should remove a skip and update the skips count', function (done) {
      createBeer(function (err, beer) {
        beer.skip(user, function (err, beer) {
          beer.unskip(user, function (err, beer) {
            expect(err).to.not.exist;
            expect(beer).to.be.an.instanceOf(Beer);
            expect(beer.skipsCount).to.equal(0);
            done();
          });
        });
      });
    });

    it('should add a skip and remove any ratings', function (done) {
      Beer.findOne({ name: 'Beer 1' }, function (err, beer) {
        beer.rate(user, 3, function (err, beer) {
          beer.skip(user, function (err, beer) {
            expect(err).to.not.exist;
            expect(beer).to.be.an.instanceOf(Beer);
            expect(beer.ratings).to.have.length(0);
            expect(beer.ratingsCount).to.equal(0);
            done();
          });
        });
      });
    });

    it('should add a skip and remove any todos', function (done) {
      Beer.findOne({ name: 'Beer 1' }, function (err, beer) {
        beer.addTodo(user, function (err, beer) {
          beer.skip(user, function (err, beer) {
            expect(err).to.not.exist;
            expect(beer).to.be.an.instanceOf(Beer);
            expect(beer.todos).to.have.length(0);
            expect(beer.todosCount).to.equal(0);
            done();
          });
        });
      });
    });

    it("should remove a user's skips when user is removed", function (done) {
      User.create({ username: 'henry' }, function (err, user) {
        Beer.find({ name: { $in: ['Beer 1', 'Beer 2'] } }, function (err, beers) {
          beers[0].skip(user, function (err, beer) {
            beers[1].skip(user, function (err, beer) {
              user.remove(function (err, user) {
                // User a timeout because Beer.removeTodos() is called post remove
                setTimeout(function () {
                  Beer.find({ name: { $in: ['Beer 1', 'Beer 2'] } },
                    function (err, beers) {
                      expect(beers[0].skips).to.have.length(0);
                      expect(beers[0].skipsCount).to.equal(0);
                      expect(beers[1].skips).to.have.length(0);
                      expect(beers[1].skipsCount).to.equal(0);
                      done();
                    });
                }, 100);
              });
            });
          });
        });
      });
    });

  });

  describe('finders', function () {

    it('should return unrated, unskipped, non-todo beers for a user', function (done) {
      Beer.findOne({ name: 'Beer 1' }, function (err, beer_1) {
        // Rate a beer
        beer_1.rate(user, 3, function (err, beer_1) {
          Beer.findOne({ name: 'Beer 2' }, function (err, beer_2) {
            // Add a todo
            beer_2.addTodo(user, function (err, beer_2) {
              Beer.findOne({ name: 'Beer 3' }, function (err, beer_3) {
                // Skip a beer
                beer_3.skip(user, function (err, beer_3) {
                  Beer.findUnrated(user, function (err, beers) {
                    expect(err).to.not.exist;
                    expect(beers).to.have.length(2);
                    expect(beers.indexOf(beer_1)).to.equal(-1);
                    expect(beers.indexOf(beer_2)).to.equal(-1);
                    expect(beers.indexOf(beer_3)).to.equal(-1);
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });

    it('should limit the number of unrated beers returned', function (done) {
      Beer.findUnrated(user, { limit: 1 }, function (err, beers) {
        expect(err).to.not.exist;
        expect(beers).to.have.length(1);
        done();
      });
    });

    it('should return rated beers for a user', function (done) {
      Beer.findOne({ name: 'Beer 5' }, function (err, beer_5) {
        beer_5.rate(user, 5, function (err, beer_5) {
          Beer.findRated(user, function (err, beers) {
            expect(err).to.not.exist;
            expect(beers).to.have.length(1);
            expect(beers[0].name).to.equal('Beer 5');
            done();
          });
        });
      });
    });

    it('should limit the number of rated beers returned', function (done) {
      Beer.find({ name: { $in: ['Beer 1', 'Beer 2', 'Beer 3'] } }, function (err, beers) {
        beers[0].rate(user, 3, function (err, beer_1) {
          beers[1].rate(user, 3, function (err, beer_2) {
            beers[2].rate(user, 5, function (err, beer_3) {
              Beer.findRated(user, { limit: 1 }, function (err, beers) {
                expect(err).to.not.exist;
                expect(beers).to.have.length(1);
                done();
              });
            });
          });
        });
      });
    });

    it("should return beers in a user's todo list", function (done) {
      Beer.find({ name: { $in: ['Beer 1', 'Beer 2'] } }, function (err, beers) {
        beers[0].addTodo(user, function (err, beer_1) {
          beers[1].addTodo(user, function (err, beer_2) {
            Beer.findTodo(user, function (err, beers) {
              expect(err).to.not.exist;
              expect(beers).to.have.length(2);
              expect(['Beer 1', 'Beer 2']).to.contain(beers[0].name);
              expect(['Beer 1', 'Beer 2']).to.contain(beers[1].name);
              done();
            });
          });
        });
      });
    });

    it('should limit the number of beers returned in the todo list', function (done) {
      Beer.find({ name: { $in: ['Beer 1', 'Beer 2'] } }, function (err, beers) {
        beers[0].addTodo(user, function (err, beer_1) {
          beers[1].addTodo(user, function (err, beer_2) {
            Beer.findTodo(user, { limit: 1 }, function (err, beers) {
              expect(err).to.not.exist;
              expect(beers).to.have.length(1);
              done();
            });
          });
        });
      });
    });

    it("should return a user's skipped beers", function (done) {
      Beer.find({ name: { $in: ['Beer 1', 'Beer 2'] } }, function (err, beers) {
        beers[0].skip(user, function (err, beer_1) {
          beers[1].skip(user, function (err, beer_2) {
            Beer.findSkipped(user, function (err, beers) {
              expect(err).to.not.exist;
              expect(beers).to.have.length(2);
              expect(['Beer 1', 'Beer 2']).to.contain(beers[0].name);
              expect(['Beer 1', 'Beer 2']).to.contain(beers[1].name);
              done();
            });
          });
        });
      });
    });

    it('should limit the number of skipped beers returned', function (done) {
      Beer.find({ name: { $in: ['Beer 1', 'Beer 2'] } }, function (err, beers) {
        beers[0].skip(user, function (err, beer_1) {
          beers[1].skip(user, function (err, beer_2) {
            Beer.findSkipped(user, { limit: 1 }, function (err, beers) {
              expect(err).to.not.exist;
              expect(beers).to.have.length(1);
              done();
            });
          });
        });
      });
    });

  });

});