
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),   // q: ist das hier jetzt /routes/index.js?
  api = require('./routes/api');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index); //q: was ist index hier? eine datei oder ein export aus index.js? -> eine funktion denke ich
app.get('/partials/:name', routes.partials); // q: wo wird diese routen aufgerufen???

// JSON API

app.get('/api/clone/:id', api.clonePostMethod); // in api.js
app.get('/api/posts', api.posts);
app.get('/api/post/:id', api.post);

app.post('/api/post', api.addPost);
app.put('/api/post/:id', api.putPost);
app.delete('/api/post/:id', api.deletePost);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server
var port = process.env.PORT || 3000;   // heroku port oder 3000 für local
//app.listen(process.env.PORT, function(){
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
