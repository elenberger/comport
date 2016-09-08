
var mongoose    = require('mongoose');
var settings    = require('../settings');


//mongoose.connect('mongodb://sysdba:masterkey@ds025742.mlab.com:25742/comport_dev');
mongoose.connect(settings.dbconstr);
var db = mongoose.connection;

db.on('error', function (err) {
    console.log('connection error:' + err.message);
});
db.once('open', function callback () {
    console.log("Connected to DB!");
});



var Schema = mongoose.Schema;

// Schemas


var counters = new Schema({
	_id:String,
	seq: {type: Number, default: 1}
});


var users = new Schema({
    userid: {type: String, maxlength: 10 },
    pass: {type: String},
	name: String,
	email: String,
	address: String,
    comment: String,
    sadm: Boolean,
    roles: [{type: String, enum: ["", "ADMINISTRATOR", "AP-ORD", "AP-INV", "AR-ORD", "AR-INV"]}],
    partners: [{crdate: {type: Date, default: Date.now}, partner: { type: Schema.Types.ObjectId, ref: 'partners' }}]
});

var partners = new Schema({
    partnerid: {type: String, required: true},
    partnername: {type: String, required: true},
	email: {type: String, required: true},
	address: {type: String},
    comment: {type: String}
});

var orders = new Schema({
    partnerid: String,
    num:  {type: String, required: true, maxlength: 20},
    date: String,
    netamount: String,
    vatamount: String,
    currency:  String,
    curr: String,
    stat: String,
    note: String,
    crdate: {type: Date, default: Date.now},
    parties: [{role: {type: String}, partnerid: {type: String}}],
    approval: [{stepno: {type: Number}, steptype: {type: String}, partnerid: {type: String}, resolver: {type: String}, resdate: {type: Date}, note: {type: String}, approve: {type: Boolean}}]
});


var invoices = new Schema({
    partnerid: String,
    num:  {type: String, required: true, maxlength: 20},
    date: String,
    stat: String,
    posting: String,
    extdocument: String,
    lasterr: String,
    netamount: String,
    vatamount: String,
    currency:  String,
    note: String,
    crdate: {type: Date, default: Date.now},
    order: { type: Schema.Types.ObjectId, ref: 'orders', required: true },
    parties: [{role: {type: String}, partnerid: {type: String}}],
    approval: [{stepno: {type: Number}, steptype: {type: String}, partnerid: {type: String}, resolver: {type: String}, resdate: {type: Date}, note: {type: String}, approve: {type: Boolean}}]
});




// /Workflow schema
var workflows = new Schema({
    wfid: {type: String},
    partnerid: {type: String},
    steps: [{stepno: {type: Number}, steptype: {type: String}, role: {type: String} }] // steptype=[approval,
																						// notification]
})


// Models

var countersModel = mongoose.model('counters', counters);
var usersModel = mongoose.model('users', users);
var partnersModel = mongoose.model('partners', partners);
var ordersModel = mongoose.model('orders', orders);
var invoicesModel = mongoose.model('invoices', invoices);
var workflowsModel = mongoose.model('workflows', workflows);


// utils

getNextId = function(sType) {
	return new Promise(function(resolve, reject){
		countersModel.findOneAndUpdate(
				{_id: sType},
				{ $inc: { seq: 1 }},
				{new: true, upsert: true},
		function(err, oNext) {
					if (err) return  reject(err);
					return resolve(oNext.seq);
				}
		)

	});
};





module.exports.usersModel = usersModel;
module.exports.partnersModel = partnersModel;
module.exports.ordersModel = ordersModel;
module.exports.invoicesModel = invoicesModel;
module.exports.workflowsModel = workflowsModel;

module.exports.getNextId = getNextId;
