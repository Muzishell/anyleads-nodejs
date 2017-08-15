# anyleads-nodejs
Wrap anyleads's API in node.js

## Installation

The module is distributed through npm (node package manager) and can be
installed using:

```
npm install anyleads --save
yarn add anyleads
```

The `--save` automatically adds the module to your `package.json` definition.


## Usage

You require the module as any other node.js module:
```js
var Anyleads = require('anyleads');
```
Then create a new instance with your API key
```js
var al = new Anyleads('YOUR API KEY');
```

Note: Your secret API key, you can generate it in your dashboard from https://anyleads.com/search/api/dashboard/keys


## Domain search API
Returns all the email addresses found using one given domain name.
```js
al.searchDomain('soundsgood.co').then(function(result) {
    console.log(result);
}).catch(function(err) {
    console.log(err);
});
```

## Email Pattern API
Allows you to find the email's pattern used by a company
```js
al.pattern('soundsgood.co').then(function(result) {
    console.log(result);
}).catch(function(err) {
    console.log(err);
});
```

## Email Verify API
Allows you to verify the deliverability of an email address.
```js
al.verify('charles.baudelaire@yahoo.com').then(function(result) {
    console.log(result);
}).catch(function(err) {
    console.log(err);
});
```
## Email Finder / Generate by Domain API
Generates the most likely email address from a domain name, a first name and a last name.
```js
al.generateByDomain('soundsgood.co', 'ziggy', 'marley').then(function(result) {
    console.log(result);
}).catch(function(err) {
    console.log(err);
});
```
## License
The package anyleads is released under the MIT License.

## Contributing

1. Fork it ( https://github.com/Muzishell/anyleads-nodejs )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
