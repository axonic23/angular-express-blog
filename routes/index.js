
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index');   // q: wie kommt man hier auf die view/index.jade?  weil von index.jade ausgegangen wird? -> über app.set(ivwe , "/views")
};

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};