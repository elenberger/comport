
var mongoose    = require('mongoose');


mongoose.connect('mongodb://sysdba:masterkey@ds025742.mlab.com:25742/comport_dev');
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
    userid: {type: String, maxlength: 10 },
    pass: {type: String},
	name: String,
	email: String,
	address: String,
    comment: String,
    sadm: Boolean
});

var partners = new Schema({
    partnerid: String,
	email: String,
	address: String,
    comment: String,
    users: [{userid: {type: String, maxlength: 10 }}]        
});

var orders = new Schema({
    partnerid: String,
    num:  {type: String, required: true, maxlength: 20},
    date: String,
    stat: String,
    note: String,
    partners: [{role: {type: String}, partnerid: {type: String}}]
});
    
var orderDetail = new Schema({
      id: {type: String},
			descr:{type: String},
			dstart: {type: String},
			dfinish: {type: String},
			pos: [ {id: {type: String}, text: {type: String}, amount: {type: String}}	],
parties: [{role: {type: String}, id: {type: String}, text: {type: String}}]
  });




///Workflow schema 
var workflows = new Schema({
    wfid: {type: String},
    partnerid: {type: String},
    steps: [{stepno: {type: Number}, steptype: {type: String}, role: {type: String} }] //steptype=[approval, notification]
})


var usersModel = mongoose.model('users', users);
var partnersModel = mongoose.model('partners', partners);
var ordersModel = mongoose.model('orders', orders);

module.exports.usersModel = usersModel;
module.exports.partnersModel = usersModel;
module.exports.ordersModel = ordersModel;