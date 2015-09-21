## circle

Minimalistic NodeJS API Server.

## Install

```bash
$ npm install circle
```

## Usage

### Defining A Simple Server

```js
var circle = require('circle')

var api = circle({
  '/person/:name/:surname': person,
  '/company/:id': company,
  '/': home
})

api.start(8080, 'localhost')
```

### Routing

Accepting requests to URLs like `/person/john/smith?email=john@smith.com`

```js
function person (reply, match) {
  reply(undefined, { name: match.params.name, surname: match.params.surname, email: match.params.query.email })
}
```

This will output:

```json
{
        "ok": true,
        "result": [
                {
                        "name": "john",
                        "surname": "smith",
                        "email": "john@smith.com"
                }
        ]
}
```

Producing errors:

```
function company (reply, match) {
  reply({ not_implemented: true }) // returns error
}
```

It handles POST data and file uploads nicely:

```js
function create (reply, match, post, files) {
  match.params
  // => { name: 'foo', age: 21 }

  files
  // => { profilePicture: { path: '/tmp/foo.tar.gz', size: 1024 }}

  reply (undefined, { created: true })
}
```

### Streams

Reply functions are writable streams:

```js
api = circle({
  '/readme': readme
})

function readme (reply) {
  fs.readFileStream('./README.md').pipe(reply)
}
```

### JSONP

Circle outputs the response in JSONP format for requests made by passing "callback" parameter.

### Formatting Output For Specific "Accept" Types

Circle servers will output JSON by default. To format the output for specific "Accept" header:

```js
api.format('/person/:name/:surname', 'text/plain', function (context, match) {
  return {
    contentType: 'text/plain',
    response: 'Name: ' + context.result.name + ' Surname: ' + context.result.surname
  };
});
```

Will output below for `curl http://localhost:8080/person/john/smith?email=john@smith.com`:

```js
Name: John
Surname: Smith
Email: john@smith.com
```
