
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),   // q: ist das hier jetzt /routes/index.js?
  session = require('express-session'), 

  api = require('./routes/api');

var passport = require('passport'), 
 LocalStrategy = require('passport-local').Strategy;


 passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');

var app = module.exports = express.createServer();

// Configuration
/*
passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log(username + ' ' + password);
    if (username === 'a') {
      var user = {name : username , age : 42};
           return done(null, user);
    }
    else {
        return done(null, false, { message: 'Incorrect username.' });
    }
   
  }
));
*/



var myconnection = {};
// postgres://icxyahacpgkjdy:MAbPxkhbYP3yGyaHFjqhTxH3HS@ec2-54-83-52-71.compute-1.amazonaws.com:5432/d74440l4p0o95
if (process.env.DATABASE_URL){
   myconnection = process.env.DATABASE_URL;
}
else {
   myconnection = {
    host     : '127.0.0.1',
    user     : 'postgres',
    password : 'zenkit123',
    database : 'mytestpg'
  };
}

console.log('k1');
var knex = require('knex')({
  client: 'pg',
  connection: myconnection
});


passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log('local strat:'+ username + ' ' + password);
  
    knex.select('myname','mypassword').from('mypostusers') .where('myname',username)
      .then(function(users){
        console.log('found'+users[0]);
        if (users.length===0){
             return done(null, false, { message: 'No existing username.' });
        }

          if (users[0].mypassword === password){
                console.log('success');
            return done(null, users[0]);
          }
            else {
                    console.log('login failed');
              return done(null, false, { message: 'Incorrect username.' });
          }
          console.log(users[0]);
      });
  
  }

));




app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });

//app.use(express.session({ secret: 'keyboard cat' }));
  //app.use(express.cookieParser('keyboard cat'));
//  app.use(express.bodyParser());

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.session({ secret: 'keyboard cat' }));

/*var sessionIdCounter  = 0;
app.use(session({
  genid: function(req) {
    return sessionIdCounter++; // use UUIDs for session IDs
  },
  secret: 'keyboard cat'
}))
*/

  app.use(passport.initialize());
  app.use(passport.session());


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


api.init(passport);

// JSON API
app.get('/api/currentuser', api.getCurrentUser); // in api.js
app.post('/api/login', api.loginPostMethod); // in api.js
app.post('/api/adduser', api.addUserPostMethod); // in api.js
app.post('/api/logout', api.logoutPostMethod); // in api.js
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
