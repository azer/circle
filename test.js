var circle = require("./");
var request = require("request");
var getJSON = require("get-json");

describe('a server', function(){
  var server;
  var api;

  before(function(done){
    api = circle({
      '/human/:id': human,
      '/animal/:id': animal,
      '/createHuman': createHuman,
      '/fruit/:kind/price/:price': fruit
    });

    api.format('/fruit/:kind/price/:price', 'text/plain', function (context, match) {
      return {
        'content-type': 'text/plain',
        'response': 'Fruit: ' + context.result.kind + ' Price: ' + context.result.price
      };
    });

    server = api.start(1339, 'localhost');
    done();
  });

  it('welcomes', function(done){
    getJSON('http://localhost:1339', function (error, res) {
      if(error) return done(error);
      expect(res.result.welcome).to.equal(true);
      expect(res.result.endpoints).to.deep.equal([ '/human/:id', '/animal/:id', '/createHuman', '/fruit/:kind/price/:price', '/' ]);
      done();
    });
  });

  it('serves given data', function(done){
    getJSON('http://localhost:1339/human/1', function (error, res) {
      expect(error).to.not.exist;
      expect(res.ok).to.be.true;
      expect(res.result).to.deep.equal(humans[1]);

      getJSON('http://localhost:1339/animal/4', function (error, res) {
        expect(error).to.not.exist;
        expect(res.ok).to.be.true;
        expect(res.result).to.deep.equal(animals[4]);
        done();
      });

    });
  });

  it('raises invalid resource error', function(done){
    getJSON('http://localhost:1339/foobar/1', function (error, res) {
      expect(res.error['not-found']).to.be.true
      done();
    });
  });

  it('raises not found error for unexisting data', function(done){
    getJSON('http://localhost:1339/animal/9', function (error, res) {
      expect(res.error['not-found']).to.be.true
      done();
    });
  });

  it('allows formatting output based on accept header', function(done){
    var options = {
      url: 'http://localhost:1339/fruit/orange/price/2.5',
      headers: {
        accept: 'text/plain'
      }
    };

    request(options, function (error, response, body) {
      expect(error).to.not.exist;
      expect(body).to.equal('Fruit: orange Price: 2.5');
      done();
    });
  });

  it('creates a new human by posting data', function(done){
    var options = {
      url: 'http://localhost:1339/createHuman?foo=bar',
      form: { id: 22, name: 'foo', age: 30 }
    };

    request.post(options, function (error, response, body) {
      expect(error).to.not.exist;
      var re = JSON.parse(body);
      expect(re.result.created).to.be.true;
      expect(re.result.foo).to.equal('bar');
      expect(humans[22].name).to.equal('foo');
      delete humans[22];
      done();
    });
  });

  after(function(done){
    server.close();
    done();
  });

});

describe('a server with a default resource', function(){
  var server, api;

  before(function(done){
    api = circle({
      'human': human,
      'animal': animal,
      '/:id': human
    });

    server = api.start(1339, 'localhost');
    done();
  });

  it('has a default resource', function(done){
    getJSON('http://localhost:1339/1', function (error, res) {
      expect(error).to.not.exist;
      expect(res.ok).to.be.true;
      expect(res.result).to.deep.equal(humans[1]);
      done();
    });
  });

  after(function(done){
    server.close();
    done();
  });
});

var humans = {
  1: { name: 'Azer', age: 26 },
  2: { name: 'Arda', age: 23 }
};

var animals = {
  3: { name: 'Foo', age: 6 },
  4: { name: 'Bar', age: 3 }
};

function human (reply, match) {
  if (!humans[match.params.id]) return reply({ message: { 'not-found': true } }, 404);
  reply(undefined, humans[match.params.id]);
}

function animal (reply, match) {
  if (!animals[match.params.id]) return reply({ message: { 'not-found': true } }, 404);
  reply(undefined, animals[match.params.id]);
}

function fruit (reply, match) {
  reply(undefined, { kind: match.params.kind, price: match.params.price });
}

function createHuman (reply, match, human, files) {
  humans[human.id] = human;
  reply(undefined, { created: true, foo: match.qs.foo });
}
