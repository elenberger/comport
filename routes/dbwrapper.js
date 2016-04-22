
var mongoose    = require('mongoose');


mongoose.connect('mongodb://sysdba:masterkey@ds036178.mongolab.com:36178/ui5backend');
var db = mongoose.connection;

db.on('error', function (err) {
    console.log('connection error:' + err.message);
});
db.once('open', function callback () {
    console.log("Connected to DB!");
});

var Schema = mongoose.Schema;

//Schemas

var users = new Schema({
  id: {type: String},
  pass: {type: String},
	name: String,
	email: String,
	sadm: Boolean
});

var orders = new Schema({
      id: {type: String},
			descr:{type: String},
			dstart: {type: String},
			dfinish: {type: String},
			pos: [ {id: {type: String}, text: {type: String}, amount: {type: String}}	],
			parties: [{role: {type: String}, id: {type: String}, text: {type: String}}]
  });

var partners = new Schema({
	partnerid: String,
	Name: String,
	address: {Country: String, city: String, street: String, email:String}	
});

var usersModel = mongoose.model('users', users);
var ordersModel = mongoose.model('orders', orders);

module.exports.usersModel = usersModel;
module.exports.ordersModel = ordersModel;