# gun-synclist

## Intro

`gun-synclist` is a module for Gun(^0.9.x) using `Gun.chain`.
It is basicly the same as the  `open()` module included in Gun/lib. But where `open()` gives you the full document ( Object ) on every change, `gun-synclist` behaves a little different.

* On initial run `gun-synclist` will return the full `set` as an Array!
  ( including the internally used 'lookup' { soul:index })
* On every change after the initial run it only returns the changed node.
  but...It gives you the soul of the node, the index in the Array and the full
  node ( Yeah...including nested properties )

  eg: { soul: "AbCd123..." ,idx: 112, node: {...}

### Why?
If you have a list with a lot of items you don't want to rebuild your DOM on every change. Instead you only need to change the changed item.

eg: `items.splice( idx,1,node )`

[What you could do with gun-synclist]( https://codepen.io/Stefdv/pen/WzJwqq )

## Setup

##### Prerequisites
You need Gun ^0.9.x
```
 npm install gun-synclist
```

### Node.js
```
var Gun = require('gun');
require('gun-synclist');
```

### Browser
Just include it as a script tag, and gun-synclist takes care of the rest.
```
<!-- AFTER you load Gun -->
<script src="node_modules/gun-synclist/gun-synclist.js"></script>
```

## Example
Not much to it..

```
var items;
var gun = Gun();
var CONTACTS = gun.get('CONTACTS');
CONTACTS.set( { name:'Stefdv',age: 44,profile:{email:"myemail@home.nl"}} )

CONTACTS.synclist( obj => {
  if(obj.list) {
    // initial only!
    items = obj.list;
  } 
  if(obj.node) {
    // on every change.
    items.splice(obj.idx,1,obj.node)
  }
})
```

## Note: 
`gun-synclist` will automatically load everything it can find on the context. This may sound convenient, but may be unnecessary and excessive - resulting in more bandwidth and slower load times for larger data. It could also result in your entire database being loaded, if your app is highly interconnected.
Therefore `gun-synclist` should be used on a `set`. 

 That being said... tell me what you want to do and - maybe- i can advise you. I'm not much of an email reader so ping me in [gitter](https://gitter.im/amark/gun) @Stefdv
 
### Credits
Thanks to Mark Nadal for writing Gun and for helping out whenever i need.
