# cats-js

Node.js module that provides an API wrapper for [The Cat API](http://thecatapi.com/).

[![NPM](https://nodei.co/npm/cats-js.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/cats-js/)

## Features

* Get random cats
* Save & load cats you like
* 100% promise based
* JSON Output
* And more!


## Simple Example

``` javascript
var cats = require("cats-js");

var c = new cats();

c.get().then((cat) => {console.log(cat)});

```

## Output

``` javascript
{ images:
  { image: 
    { url: 'http://24.media.tumblr.com/tumblr_m34d23c4x21qhwmnpo1_500.jpg',
      id: '42p',
      source_url: 'http://thecatapi.com/?id=42p'
    }
  }
}
```

## More complex example

``` javascript
var cats = require("cats-js");

var c = new cats();

c.get({results_per_page: 10, type: "gif"}).then((cats) => {console.log(cats)});
```

## Output

``` javascript
{ images:
   { image:
      [ [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object],
        [Object] 
      ]
   }
}
```

### See docs/index.html for a detailed documentation!