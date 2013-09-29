var resources = require("./");
var request = require("request");
var getJSON = require("get-json");

describe('a server', function(){
  var server;

  before(function(done){
    resources({
      'human': human,
      'animal': animal
    });

    server = resources.start('localhost', 1339);
    done();
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
      expect(res.error.invalid_resource).to.be.true;
      done();
    });
  });

  it('raises not found error for unexisting data', function(done){
    getJSON('http://localhost:1339/animal/9', function (error, res) {
      expect(res.error.not_found).to.be.true;
      done();
    });
  });

  after(function(done){
    server.close();
    done();
  });

});

describe('a server with a default resource', function(){

  var server;

  before(function(done){
    resources({
      'human': human,
      'animal': animal,
      '*': human
    });

    server = resources.start('localhost', 1339);
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

function human (params, reply) {
  var id = params[0];

  if (!humans[id]) reply({ not_found: true }, 404);

  reply(undefined, reply(undefined, humans[id]));
}

function animal (params, reply) {
  var id = params[0];
  if (!animals[id]) reply({ not_found: true }, 404);
  reply(undefined, reply(undefined, animals[id]));
}
