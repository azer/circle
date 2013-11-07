## circle

Minimalistic NodeJS API Server.

## Install

```bash
$ npm install circle
```

## Usage

### Defining A Simple Server

```js
circle = require('circle')

api = circle({
  '/person/:name/:surname': person,
  '/company/:id': company,
  '/': home
})

api.start(8080, 'localhost')
```

### Routing

Accepting requests to URLs like `/person/john/smith?email=john@smith.com`

```js
function person (reply, name, surname) {
  reply(undefined, { name: name, surname: surname, email: reply.qs.email })
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
function company (params, reply) {
  reply({ not_implemented: true }) // returns error
}
```

It handles POST data and file uploads nicely:

```js
function create (reply, params, post, files) {
  params
  // => { name: 'foo', age: 21 }

  files
  // => { profilePicture: { path: '/tmp/foo.tar.gz', size: 1024 }}

  reply (undefined, { created: true })
}
```

### JSONP

Circle outputs the response in JSONP format for requests made by passing "callback" parameter.

### Formatting Output For Specific "Accept" Types

Circle servers will output JSON by default. To format the output for specific "Accept" header:

```js
api.format('/person/:name/:surname', 'text/plain', function (response) {
  if (response.error) return 'Error: ' + response.error;

  return 'Name: ' + response.result.name + ' Surname: ' + response.result.surname + ' E-Mail: ' + response.result.email;
});
```

Will output below for `curl http://localhost:8080/person/john/smith?email=john@smith.com`:

```js
Name: John
Surname: Smith
Email: john@smith.com
```
