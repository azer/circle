## json-resources

Minimalistic JSON API Server. Takes care of all you need to get done a simple API server.

## Install

```bash
$ npm install json-resources
```

## Usage

```js
resources = require('json-resources')

server = resources({
  person: person,
  company: company,
  create: create,
  default: person
})

server.start('localhost', 8080)

function person (params, reply) {
  params
  // => ['foo', 'bar'] if request was sent to /person/foo/bar
  params.qs
  // => { parsed: 'querystrings' }

  reply(undefined, { name: 'foo', age: 10 })
}

function company (params, reply) {
  reply({ not_implemented: true }) // returns error
}

function create (params, reply) {
  params.data
  // => { name: 'foo', age: 21 }

  reply (undefined, { created: true })
}
```

Example requests to the server implemented above:

```
curl http://localhost:8080/person/1
curl -X POST -H -d '{ name":"foo", "age":21 }' http://localhost:8000/create
curl http://localhost:8080/person/1?callback=foobar
curl http://localhost:8080/person/1.js?callback=foobar
curl http://localhost:8080/person/1.json?callback=foobar
```
