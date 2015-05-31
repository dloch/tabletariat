// Generated by CoffeeScript 1.9.2
(function() {
  define("tabletariat", ["lodash"], function(_) {
    var allComms, dispatch, handlers, module, updateComms;
    window.comms = {};
    handlers = {
      commAction: [
        function(x) {
          switch (x) {
            case "enroll":
              return module.enroll(this.source);
            case "disenroll":
              return module.disenroll(this.source);
          }
        }
      ]
    };
    allComms = function() {
      var origin, windows;
      return _.flatten((function() {
        var results;
        results = [];
        for (origin in comms) {
          windows = comms[origin];
          results.push(windows);
        }
        return results;
      })());
    };
    dispatch = function(event) {
      var a, ref, results, v;
      ref = event.data;
      results = [];
      for (a in ref) {
        v = ref[a];
        results.push(_.map(handlers[a], function(f) {
          return f.call(event, v);
        }));
      }
      return results;
    };
    updateComms = function(client, callback) {
      var origin;
      origin = client.location.origin;
      comms[origin] || (comms[origin] = []);
      callback(client.location.origin, client);
      if (comms[origin].length === 0) {
        return delete comms[origin];
      }
    };
    module = {
      debug: function() {
        debugger;
      },
      verbose: function() {
        module._dispatch = dispatch;
        return dispatch = function(event) {
          var k, ref, v;
          ref = event.data;
          for (k in ref) {
            v = ref[k];
            console.debug(event.source.guid + " - " + k + ": " + v);
          }
          return module._dispatch(event);
        };
      },
      unverbose: function() {
        dispatch = module._dispatch;
        return delete module._dispatch;
      },
      showComms: function() {
        return console.debug(comms);
      },
      enroll: function(client) {
        if (!_.include(allComms(), client)) {
          module.broadcastAs({
            commAction: "enroll"
          }, client);
          updateComms(client, function(origin, toAdd) {
            return comms[origin].push(toAdd);
          });
          return module.send(client, {
            commAction: "enroll"
          });
        }
      },
      disenroll: function(client) {
        return updateComms(client, function(origin, toRemove) {
          return _.remove(comms[origin], toRemove);
        });
      },
      broadcast: function(message) {
        return this.sendAll(allComms(), message);
      },
      broadcastAs: function(message, impostee) {
        return this.sendAllAs(allComms(), message, impostee);
      },
      sendAll: function(clients, message) {
        var client, i, len, results;
        results = [];
        for (i = 0, len = clients.length; i < len; i++) {
          client = clients[i];
          results.push(module.send(client, message));
        }
        return results;
      },
      sendAllAs: function(clients, message, impostee) {
        var client, i, len, results;
        results = [];
        for (i = 0, len = clients.length; i < len; i++) {
          client = clients[i];
          results.push(impostee.impose(client, message));
        }
        return results;
      },
      send: function(client, message) {
        return client.postMessage(message, location.origin);
      },
      on: function(action, callback) {
        handlers || (handlers = []);
        return handlers[action].push(callback);
      },
      off: function(action, callback) {
        return _.remove.apply(callback ? handlers[action](callback) : handlers(action));
      },
      one: function(action, callback) {
        return module.on(action, function() {
          callback.apply(this, arguments);
          return module.off(action, callback);
        });
      },
      createGuid: Math.random,
      build: function() {
        window.impose = module.send;
        window.addEventListener("message", dispatch);
        return window.opener && module.send(window.opener, {
          commAction: "enroll"
        });
      },
      destroy: function() {
        module.broadcast({
          commAction: "disenroll"
        });
      }
    };
    return module;
  });

  require(["tabletariat"], function(tc) {
    tc.verbose();
    window.guid = tc.createGuid();
    tc.build();
    return window.onbeforeunload = tc.destroy;
  });

}).call(this);
