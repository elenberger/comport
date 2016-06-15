var ordersModel = require('./dbwrapper').ordersModel;
var workflowsModel = require('./dbwrapper').workflowsModel;

var rest = require('./restcallwrapper');

var getPartnerById = require('./partners').getPartnerById;
var getUser = require('./users').getUser;

var mongoose = require('mongoose');
var ValidationError = mongoose.Error.ValidationError;
var ValidatorError = mongoose.Error.ValidatorError;

testImport = function() {

	// Временное добавление данных
	var order1 = new ordersModel({
		id : "1002",
		descr : "1233",
		dstart : "01.01.2016",
		dfinish : "31.03.2016",
		pos : [ {
			"id" : "1",
			"text" : "service1",
			"amount" : 1334.34
		}

		, {
			"id" : "2",
			"text" : "service2",
			"amount" : 150.01
		} ],
		parties : [ {
			"role" : "vendor",
			"id" : "1234567894",
			"text" : " Aldomayer AG"
		}

		, {
			"role" : "billto",
			"id" : "1234567895",
			"text" : " Schweriner moebel GmbH"
		} ]

	});

	// console.log("save");
	order1.save(function(err) {
	});

};

addRecord = function(req, res) {

	// var Order = new ordersModel(req.body);
	// Order.save();

	ordersModel.schema.pre('save', function(next) {
		if (this.num.length > 10) {
			var error = new ValidationError(this);
			error.errors.num = new ValidatorError('num',
					'length for number is invalid', 'notvalid', this.num);
			return next(error);
		}

		this.stat = 'Approval';

		var oOrder = this;

		// init approval procedure

		workflowsModel.findOne({
			wfid : "dummy"
		}).lean().exec(
				function(err, workflow) {
					if (err) {
						console.log(err);
						return res.end(err);
					}

					var aSteps = workflow.steps;

					for (i = 0; i < aSteps.length; i++) {
						var oOrderWorkflowStep = {};

						oOrderWorkflowStep.stepno = i + 1;
						oOrderWorkflowStep.steptype = aSteps[i].steptype;
						oOrderWorkflowStep.partnerid = findPartyPartnerId(
								oOrder.parties, aSteps[i].role);

						if (i == 0) {
							oOrderWorkflowStep.approve = true;
						}

						oOrder.approval.push(oOrderWorkflowStep);
					}

					next();
				});

	});

	ordersModel.create(req.body, function(err, order) {

		if (err) {
			console.log(err);
			return res.send(err)
		}

		return res.send(order);

	});

};

getList = function(req, res) {

	res.setHeader("Content-Type", "application/json");

// get partnerid's which can see user.
	getUser(req, res).then(function(oUser){
		var aPartners = [];
		if (oUser.partners) {
		for (i=0; i<oUser.partners.length; i++){
			aPartners.push(oUser.partners[i].partner.partnerid);
		}
		}
		
		if (aPartners.length == 0) return res.end();
	
		ordersModel.find({partnerid: { $in: aPartners }}).lean().exec(function(err, orders) {
			
			if (err) return res.end(err);

				// add some fields in order

				var pOrders = new Promise(function(resolve, reject) {
					var aProm = [];
					for (var s = 0; s < orders.length; s++) {
						var oDoc = orders[s];

						aProm.push(_getOrder(oDoc));

					}

					Promise.all(aProm).then(function(aDocs) {
						resolve(orders);
					});

				});

				pOrders.then(function(orders) {

					res.write(JSON.stringify({
						orders : orders
					}));
					return res.end();
				});
	
	});
	});
};

_getOrder = function(oOrder) {

	return new Promise(function(resolve, reject) {

		getPartnerById(oOrder.partnerid).then(function(oPartner) {
			oOrder.partnername = oPartner.partnername;

			_getOrderParties(oOrder.parties).then(function(aParties) {
				oOrder.parties = aParties;
				resolve(oOrder);
			});
		});
	});
};

_getOrderParties = function(aParties) {

	return new Promise(function(resolve, reject) {
		var bLast = false;

		for (var p = 0; p < aParties.length; p++) {
			var oParty = aParties[p];

			if (p == aParties.length - 1) {
				bLast = true
			}

			getPartnerById(oParty.partnerid).then(function(oPartner) {
				oParty.partnername = oPartner.partnername;

				if (bLast) {

					resolve(aParties);
				}
			});

		}
	});
};

// Order from remote system
getOrderDetails = function(req, res) {

	// Object to retrieve and push Order details
	res.setHeader("Content-Type", "application/json");

	var sId = req.params.id;

	rest.performGetRequest("/sap/bc/rest/z_comport/po/" + sId, "",
	// success
	function(bkndres) {

		res.write(JSON.stringify({
			orderDetails : bkndres
		}));

		return res.end();

	},
	// on error
	function(error) {
		return res.end(error);

	});

	//    
	// //req.params.id
	// res.setHeader("Content-Type", "application/json");
	//    
	// var orderDetails = {
	// num: "4508937483", //string(10)
	// date: "2016-05-25", // date a string YYYY-MM-DD
	// note: "Our order", //String
	// netamout: 5000, //currency
	// vatamout: 1000,
	// positions: [{posid: 0,
	// postxt: "",
	// deliverydate: "",
	// quntity: 0,
	// price: 0,
	// netamout: 0,
	// vatamout: 0}],
	// parties: [{posid: 0,
	// partnerid: "",
	// role: "" //for PO will be Vendoe, for SO will be customer
	// } ]
	// };
	//    
	// var Details1 = orderDetails;
	//
	// res.write(JSON.stringify({
	// orderDetails: Details1
	// }));
	//        
	//
	// return res.end();

};

//  
findPartyPartnerId = function(aParties, sRole) {
	for (i = 0; i < aParties.length; i++) {
		if (sRole == aParties[i].role) {
			return aParties[i].partnerid;
		}
	}
	return "";
};

module.exports.addRecord = addRecord;
module.exports.getList = getList;
module.exports.getOrderDetails = getOrderDetails;