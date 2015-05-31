# Tabletariat

### A library for interfacing between all of your tabs, in a masterless way.

Tabs and windows of the world, unite! After initial setup, know about all sibling, parent, ancestor, and cousin tabs or windows, stay in touch, and offload work according to your need.

Put slightly more simply: An event based communication library for tabs and windows.

##To build:

```sh
  npm install
  coffee -co dist src
```

##To use:
Just include tabletariat.js on your site. Tabs spawned will automatically let their creators know about themselves, who will in turn tell of of their peers.

Adding events is similar to jquery (But maybe without the nice frills):

```js
  require(["tabletariat"], function(t){
    t.on("eventname", function(event){ console.debug("I'm an event"); });
    t.one("eventname", function(event){ console.debug("I'll only run once"); });
  })
```

So is removing events:

```js
  require(["tabletariat"], function(t){
    t.off("eventname");
  })
```

You can even remove specific events, if you really want to:

```js
  require(["tabletariat"], function(){
    var callback = function(){ console.debug("Keep track of me"); };
    t.on("eventname", callback);
    t.on("eventname", function(){ console.debug("Leave me here"); });
    t.off("eventname", callback);
  })
```

I would highly not recommend removing the commAction event. If you do so, you'll probably break being aware of new worker tabs or windows.
