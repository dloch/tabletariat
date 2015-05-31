define "tabletariat", ["lodash"], (_)->
  #Domains to windows:
  window.comms = {}

  #Handlers for events:
  handlers = commAction:
  #Include enroll/disenroll by default:
    [(x)->
      switch x
        when "enroll" then module.enroll this.source
        when "disenroll" then module.disenroll this.source
    ]

  #Convenience functions
  allComms = -> _.flatten(windows for origin, windows of comms)

  dispatch = (event)->
    _.map(handlers[a], (f)-> f.call(event, v)) for a, v of event.data

  updateComms = (client, callback)->
    origin = client.location.origin
    comms[origin] ||= []
    callback client.location.origin, client
    delete comms[origin] if comms[origin].length == 0

  module =
    #Convenience debugging
    debug: -> debugger
    verbose: ->
      module._dispatch = dispatch
      dispatch = (event) ->
        console.debug "#{event.source.guid} - #{k}: #{v}" for k, v of event.data
        module._dispatch(event)
    unverbose: ->
      dispatch = module._dispatch
      delete module._dispatch
    showComms: -> console.debug comms
   
    #Add or remove windows:
    enroll: (client)->
      unless _.include allComms(), client
        module.broadcastAs {commAction: "enroll"}, client
        updateComms client, (origin, toAdd)-> comms[origin].push toAdd
        module.send client, {commAction: "enroll"}
    disenroll: (client)->
      updateComms client, (origin, toRemove)-> _.remove comms[origin], toRemove

    #Send messages to windows (Sometimes for other windows -- Screwy, ain't it?):
    broadcast: (message)->
      this.sendAll allComms(), message
    broadcastAs: (message, impostee)->
      this.sendAllAs allComms(), message, impostee
    sendAll: (clients, message)->
      module.send client, message for client in clients
    sendAllAs: (clients, message, impostee)->
      impostee.impose client, message for client in clients
    send: (client, message)-> client.postMessage message, location.origin

    #Manipulate action handlers:
    on: (action, callback)->
      handlers ||= []
      handlers[action].push callback
    off: (action, callback)->
      _.remove.apply if callback then handlers[action] callback else handlers action
    one: (action, callback)->
      module.on action, ->
        callback.apply(this, arguments)
        module.off(action, callback)

    #Determine existence (In the ecosystem) and identity:
    createGuid: Math.random
    build: ->
      window.impose = module.send
      window.addEventListener "message", dispatch
      window.opener && module.send window.opener, {commAction: "enroll"}
    destroy: ->
      module.broadcast {commAction: "disenroll"}
      return


  return module

require ["tabletariat"], (tc)->
  tc.verbose()
  window.guid = tc.createGuid()
  tc.build()
  window.onbeforeunload = tc.destroy
