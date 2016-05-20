var basicAuth = require('basic-auth');
var usersModel = require('./dbwrapper').usersModel;

var auth = function (req, res, next) {
  function unauthorized(res) {
    console.log("unauthorized");
  //  res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  }

  var user = basicAuth(req);
  
    if (!user || !user.name || !user.pass) {
    
    //  console.log(user);
    //  console.log(req);
      
    return unauthorized(res);
  }
  

 usersModel.findOne({userid: user.name }, function (err, dbuser) {
   
   if ((err) || (!dbuser)) return unauthorized(res);
   
   
   if (user.pass == dbuser.pass) {
      console.log("authorized");
         return next();
  } else {
    console.log("credentials " + user.name + " " + user.pass + " not valid" );
    return unauthorized(res);
  }
   
   
 });
  
//   var user1 = new usersModel({
//      id: "Ivan",
//      pass: "1233"
//    });
  
//   console.log("save");
//   user1.save(function(err){});
  
  

  
  
  
//   if (user.name === 'foo' && user.pass === 'bar') {
//     console.log("authorized");
//     return next();
//   } else {
//     console.log("credentials " + user.name + " " + user.pass + " not valid" );
//     return unauthorized(res);
//   }
}

module.exports = auth;