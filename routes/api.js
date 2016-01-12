/*
 * Serve JSON to our AngularJS client
 */

// For a real app, you'd make database requests here.
// For this example, "data" acts like an in-memory "database"

var passport ;

exports.init = function(pPassport){
   passport = pPassport;
}


var data = {
  "posts": [
    {
      "title": "Lorem ipsum",
      "text": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      "title": "Sed egestas",
      "text": "Sed egestas, ante et vulputate volutpat, eros pede semper est, vitae luctus metus libero eu augue. Morbi purus libero, faucibus adipiscing, commodo quis, gravida id, est. Sed lectus."
    }
  ]
};

var users = {
  "users": [
    {
      "name": "heinz",
      "password": "123"
    },
    {
      "name": "otto",
      "password": "otto"
    }
  ]
};

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

console.log('k2');
knex.schema.createTableIfNotExists('myusers', function (table) {
  table.increments();
  table.string('myname');
  table.timestamps();
})
.catch(function(err){
   console.log(err);
});

knex.schema.createTableIfNotExists('myposts', function (table) {
  table.increments();
  table.string('mytitle');
  table.string('mytext');
  table.timestamps();
})
.catch(function(err){
   console.log(err);
});
console.log('k3');


/*
exports.posts = function (req, res) {
  var posts = [];
  data.posts.forEach(function (post, i) {
    posts.push({
      id: i,
      title: post.title,
      text: post.text
    });
  });
*/
function toClientSchema(serverPost){
  return  { text: serverPost.mytext,
                  title: serverPost.mytitle,
                id: serverPost.id
                };
}



exports.posts = function (req, res) {
  knex.select('mytitle', 'mytext', 'id').from('myposts')
    .then(function(posts){
       console.log(posts);
       res.json({
      posts: posts.map(toClientSchema)   // jesses magie: map ruft für jedes element im arry eine function auf
    });
  });

};

/*
exports.post = function (req, res) {
  var id = req.params.id;
  if (id >= 0 && id < data.posts.length) {
    res.json({
      post: data.posts[id]
    });
  } else {
    res.json(false);
  }
};
*/

exports.post = function (req, res) {
  var id = req.params.id;

  knex.select('mytitle', 'mytext', 'id').from('myposts').where('id',id)
    .then(function(posts){
       console.log(posts[0]);
       res.json({
          post: toClientSchema(posts[0])
        });

  });

};


// POST : erzeugt einen komplett neuen!
/*
exports.addPost = function (req, res) {  
  data.posts.push(req.body);
  console.log('added:');

  req.body.id = data.posts.length-1;  
  console.log(req.body);
  res.json(req.body);
};
*/
exports.addPost = function (req, res) {  
var newpost = {mytitle: req.body.title, mytext: req.body.text};
 knex('myposts').insert( newpost).returning('*')
    .then(function(posts){
       console.log(posts[0] );
       res.json( toClientSchema(posts[0]) );
  });

};

// PUT  -> q:updated ein bestehenden artikel (EDIT)
/*

exports.putPost = function (req, res) {
  var id = req.params.id;

  if (id >= 0 && id < data.posts.length) {
    data.posts[id] = req.body;
    res.json(true);
  } else {
    res.json(false);
  }
};
*/
exports.putPost = function (req, res) {
  var id = req.params.id;

knex('myposts')
  .where('id', id)
  .update({
    mytext: req.body.text,
    mytitle: req.body.title
  })
  .then(function(posts){
      res.json(true);
    });
 
 
};

// DELETE
/*
exports.deletePost = function (req, res) {
  var id = req.params.id;

  if (id >= 0 && id < data.posts.length) {
    data.posts.splice(id, 1);
    res.json(true);
  } else {
    res.json(false);
  }
};

*/


exports.deletePost = function (req, res) {
  var id = req.params.id;
knex('myposts')
  .where('id', id)
  .del()
   .then(function(posts){
      res.json(true);
    });
};

exports.getCurrentUser = function (req, res, next) {
    console.log('getCurrentUser auth?:'+req.isAuthenticated() );
    console.log('current user:' +req.user);
  res.json({currentUser:req.user});
};

exports.loginPostMethod = function (req, res, next) {
  console.log(req.body);
  var handler = passport.authenticate('local', function(err,user, info) {
      console.log(user);
      console.log(err);
      console.log(info);
      console.log('auth:'+req.isAuthenticated());
      req.login(user, function(err) {
         if (err) { 
            return next(err);
         }
         console.log('auth2:'+req.isAuthenticated());
         return res.redirect('/');
      });
  
  });
  handler(req,res,next);
};

exports.clonePostMethod = function (req, res) {
  var id = req.params.id;
  console.log(id);

  if (id >= 0 && id < data.posts.length) {
     var post = data.posts[id];
       console.log(post);
     var post2 = {
      title: post.title + ' (Cloned)',
      text: post.text,
      id : data.posts.length
     };
    data.posts.push(post2);
    console.log(post2);

   res.json(post2);
  }
};