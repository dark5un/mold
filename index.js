var MongoClient = require('mongodb').MongoClient,
    events = require('events'),
    EventEmitter = new events.EventEmitter();

var express = require('express')

var app = express()

var url = 'mongodb://localhost/frinksc'

MongoClient.connect(url, function(err, db) {
  EventEmitter.emit('mongodbConnected', err, db)
})

EventEmitter.on('mongodbConnected', function(error, db) {
  if(error) {
    db.close()
    throw error
  }
  app.db = db
})

app.get('/db/:collection/:command', function(req, res) {
  var commandArgs = Object.keys(req.query)

  commandArgs = commandArgs.map(function(arg) {
    return JSON.parse(req.query[arg])
  })

  commandArgs.push(function(error, result) {
    if(req.params.command === "find") {
      result.toArray(function(error, items) {
        res.json(items)
      })
    } else {
      res.json(result)
    }
  })
  console.log(commandArgs)
  var coll = req.app.db.collection(req.params.collection)
  coll[req.params.command].apply(coll, commandArgs)
})

app.listen(3000)
