var ordersModel = require('./dbwrapper').ordersModel;
var workflowsModel = require('./dbwrapper').workflowsModel;

var rest = require('./restcallwrapper');

var emailer = require('./emailer');

var getPartnerById = require('./partners').getPartnerById;
var getUser = require('./users').getUser;
var approveOrder = require('./approve').approveOrder;

var mongoose = require('mongoose');
var ValidationError = mongoose.Error.ValidationError;
var ValidatorError = mongoose.Error.ValidatorError;

// Route order operation(C-Create, U-update, D-Delete, A-Approve, R-Reject )

maintainOrder = function(req, res) {
	// get operation, num and partnerid from request.

	var sOper = req.body.operation;

	if (req.body.order) {
		var sOrdernum = req.body.order.num;
		var sPartnerid = req.body.order.partnerid;
	}

	if (!sOper || !sOrdernum || !sPartnerid) {
		return res.status(500).send({
			"error" : "Wrong message format"
		});
	}

	// find order and check status.
	ordersModel.findOne({
		partnerid : sPartnerid,
		num : sOrdernum
	}).exec(function(err, order) {

		switch (sOper) {

		case "C":
			if (order) {
				return res.status(500).send({
					"error" : "Order exists!"
				});
			}

			addOrder(req.body.order, req, res);

			break;
		case "U":
			// remove old order and create new
			if (order) {
				order.remove(function(err, removed) {
				});
			}
			addOrder(req.body.order, req, res);

			break;
		case "D":
			if (order) {
				order.remove(function(err, removed) {
					res.end();
				});
			} else {
				res.send({
					"error" : "Order doesn't exists"
				});
			}
			break;
		case "A":
		case "R":
			approveOrder(req, res, order);
			break;

		default:
			return res.status(500).send({
				"error" : "Wrong message format"
			});

		}

	});

};

addOrder = function(oOrder, req, res) {

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
					if (err || !workflow) {
						console.log(err);
						return res.end({
							"error" : "No workflow template found"
						});
					}

					var aSteps = workflow.steps;

					oOrder.approval.length = 0;

					for (var i = 0; i < aSteps.length; i++) {
						var oOrderWorkflowStep = {};

						oOrderWorkflowStep.stepno = i + 1;
						oOrderWorkflowStep.steptype = aSteps[i].steptype;
						oOrderWorkflowStep.partnerid = findPartyPartnerId(
								oOrder.parties, aSteps[i].role);

						if (i === 0) {
							oOrderWorkflowStep.approve = true;

							// data for email
							var oMailParams = {
								num : oOrder.num,
								partnerid : oOrder.partnerid,
								sendto : oOrderWorkflowStep.partnerid
							}
							emailer.sendOrderApproveMsg(req, oMailParams);
						}

						oOrder.approval.push(oOrderWorkflowStep);
					}

					// Last step is notification to order owner
					var oOrderWorkflowStep = {
						stepno : i + 1,
						steptype : "N",
						partnerid : oOrder.partnerid
					};
					oOrder.approval.push(oOrderWorkflowStep);

					next();
				});

	});

	ordersModel.create(oOrder, function(err, order) {

		if (err) {
			console.log(err);
			return res.send(err)
		}

		return res.send(order);

	});

};

getOwnOrders = function(req, res) {

	res.setHeader("Content-Type", "application/json");

	// get partnerid's which can see user.
	getUser(req).then(function(oUser) {
		var aPartners = [];
		if (oUser.partners) {
			for (i = 0; i < oUser.partners.length; i++) {
				aPartners.push(oUser.partners[i].partner.partnerid);
			}
		}

		if (aPartners.length == 0)
			return res.end();

		ordersModel.find({
			partnerid : {
				$in : aPartners
			}
		}).lean().exec(function(err, orders) {

			if (err)
				return res.end(err);

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

				// final corrections
				for (d = 0; d < orders.length; d++) {
					orders[d].approvable = false;
				}

				// return results
				res.write(JSON.stringify({docs: orders}));
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

				_getOrderApprovals(oOrder.approval).then(function(aApprovals) {
					oOrder.approval = aApprovals;
					resolve(oOrder);
				});

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

// process approval array
_getOrderApprovals = function(aApprovals) {

	return new Promise(
			function(resolve, reject) {

				var aStepProm = [];
				var bActiveStepFound = false;

				for (var a = 0; a < aApprovals.length; a++) {

					var oStepProm = new Promise(
							function(resolve, reject) {
								var oApprovalStep = aApprovals[a];
								getPartnerById(oApprovalStep.partnerid)
										.then(
												function(oPartner) {

													oApprovalStep.partnername = oPartner.partnername;

													// if
													// (oApprovalStep.steptype
													// == 'A') {
													// oApprovalStep.steptype =
													// 'Approval by: ';
													// } else if
													// (oApprovalStep.steptype
													// == 'N') {
													// oApprovalStep.steptype =
													// 'Notification to: ';
													// }

													oApprovalStep.approve = false;

													if (!oApprovalStep.resdate
															&& !bActiveStepFound) {
														oApprovalStep.approve = bActiveStepFound = true;

													}

													resolve(oApprovalStep);
												});
							});

					aStepProm.push(oStepProm);

				}

				Promise.all(aStepProm).then(function(oApprovalSteps) {
					resolve(oApprovalSteps);
				});

			});
};

// Order from remote system
getOrderDetails = function(req, res) {

	// Object to retrieve and push Order details
	res.setHeader("Content-Type", "application/json");

	var sId = req.params.num;

	rest.performGetRequest("/sap/bc/rest/z_comport/po/" + sId, "",
	// success
	function(bkndres) {

		res.write(JSON.stringify({
			orderDetails : bkndres.order
		}));

		return res.end();

	},
	// on error
	function(error) {
		return res.status(500).send({
			"error" : "Error while requesting data from backend"
		});

	});

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

getIncOrders = function(req, res) {

	res.setHeader("Content-Type", "application/json");

	// get partnerid's which can see user.
	getUser(req).then(function(oUser) {
		var aPartners = [];
		if (oUser.partners) {
			for (i = 0; i < oUser.partners.length; i++) {
				aPartners.push(oUser.partners[i].partner.partnerid);
			}
		}

		if (aPartners.length == 0)
			return res.end();

		ordersModel.find({
			'parties.partnerid' : {
				$in : aPartners
			}
		}).lean().exec(function(err, orders) {

			if (err)
				return res.end(err);

			// add some fields into order

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

				// final corrections, calculate if document approvable
				for (var d = 0; d < orders.length; d++) {
					var oOrder = orders[d];
					oOrder.approvable = false;

					var oRes = oOrder.approval.find(function(oApprovalStep) {
						if (oApprovalStep.approve) {
							return oApprovalStep
						}
					});

					if (oRes) {
						var sPartnerid = aPartners.find(function(sPartnerid) {
							if (sPartnerid == oRes.partnerid) {
								return sPartnerid;
							}
						});
						if (sPartnerid) {
							oOrder.approvable = true;
						}
					}

				}

				// return results
				res.write(JSON.stringify({docs: orders}));
				return res.end();
			});

		});

	});

};

orderApprove = function(sAction, oOrder) {
	// {operation, order:{partnerid num note}}
}

module.exports.maintainOrder = maintainOrder;
module.exports.getOwnOrders = getOwnOrders;
module.exports.getIncOrders = getIncOrders;
module.exports.getOrderDetails = getOrderDetails;