var invoicesModel = require('./dbwrapper').invoicesModel;
var ordersModel = require('./dbwrapper').ordersModel;
var workflowsModel = require('./dbwrapper').workflowsModel;

var rest = require('./restcallwrapper');

var mPartner = require('./partners');

var getUser = require('./users').getUser;
var mApprove = require('./approve');

maintainInvoice = function(req, res) {
	// get operation, num, partnerid, order from request.

	var sOper = req.body.operation;

	if (req.body.invoice) {
		var sInvoicenum = req.body.invoice.num;
		var sPartnerid = req.body.invoice.partnerid;
		var sOrder = req.body.invoice.order;
	}

	if (!sOper || !sInvoicenum || !sPartnerid || !sOrder) {
		return res.status(500).send({
			"error" : "Wrong message format"
		});
	}

	// find invoice and check status.
	invoicesModel.findOne({
		partnerid : sPartnerid,
		num : sOrder
	}).exec(function(err, invoice) {

		switch (sOper) {

		case "C":
			if (invoice) {
				return res.status(500).send({
					"error" : "Invoice exists!"
				});
			}

			addRecord(req.body.invoice, res);

			break;
		case "U":
			// remove old invoice and create new only if it is still in Approval
			// or Archived
			if (invoice) {
				invoice.remove(function(err, removed) {
				});
			}
			addRecord(req.body.invoice, res);

			break;
		case "D":
			if (invoice) {
				invoice.remove(function(err, removed) {
					res.end();
				});
			} else {
				res.send({
					"error" : "Invoice doesn't exists"
				});
			}
			break;
		case "A":
		case "R":
			approveInvoice(req, res, order);
			break;

		default:
			return res.status(500).send({
				"error" : "Wrong message format"
			});

		}

	});

};

findPartyPartnerId = function(aParties, sRole) {
	for (i = 0; i < aParties.length; i++) {
		if (sRole == aParties[i].role) {
			return aParties[i].partnerid;
		}
	}
	return "";
};

addRecord = function(oInvoice, res) {

	// logic before save

	invoicesModel.schema.pre('save', function(next) {
		if (this.num.length > 10) {
			var error = new ValidationError(this);
			error.errors.num = new ValidatorError('num',
					'length for number is invalid', 'notvalid', this.num);
			return next(error);
		}

		this.stat = 'Approval';

		var oInvoice = this;

		// init approval procedure

		workflowsModel.findOne({
			wfid : "dummyinv"
		}).lean().exec(
				function(err, workflow) {
					if (err)
						res.status(500).send({
							"error" : "Workflow procedure is not determined"
						});

					var aSteps = workflow.steps;

					oInvoice.approval.length = 0;

					for (var i = 0; i < aSteps.length; i++) {
						var oInvoiceWorkflowStep = {};

						oInvoiceWorkflowStep.stepno = i + 1;
						oInvoiceWorkflowStep.steptype = aSteps[i].steptype;
						oInvoiceWorkflowStep.partnerid = findPartyPartnerId(
								oInvoice.parties, aSteps[i].role);

						if (i == 0) {
							oInvoiceWorkflowStep.approve = true;
						}

						oInvoice.approval.push(oInvoiceWorkflowStep);
					}

					// Last step is notification to Invoice owner
					var oOrderWorkflowStep = {
						stepno : i + 1,
						steptype : "N",
						partnerid : oInvoice.partnerid
					};
					oInvoice.approval.push(oInvoiceWorkflowStep);

					next();
				});

	});

	// Determine Bill-to party
	var oBilltoParty = oInvoice.parties.find(function(oParty) {
		if (oParty.role === 'Billto') {

			return oParty;

		}
	});

	if (!oBilltoParty)
		res.status(500).send({
			"error" : "Bill-to party is not determined"
		});

	// validate\get PO reference and create invoice

	sBillto = oBilltoParty.partnerid;
	sOrdernum = oInvoice.order;

	ordersModel.findOne({
		partnerid : sBillto,
		num : sOrdernum
	}).exec(function(err, order) {

		if (err)
			res.status(500).send({
				"error" : "Reference order not found"
			});

		oInvoice.order = order;

		invoicesModel.create(oInvoice, function(err, invoice) {

			if (err)
				res.status(500).send({
					"error" : "Invoice is not created"
				});

			return res.send(invoice);

		});
	});

};

getOwnInvoices = function(req, res) {
	res.setHeader("Content-Type", "application/json");

	// get partnerid's which can see user.
	getUser(req, res).then(function(oUser) {
		var aPartners = [];
		if (oUser.partners) {
			for (i = 0; i < oUser.partners.length; i++) {
				aPartners.push(oUser.partners[i].partner.partnerid);
			}
		}

		if (aPartners.length == 0)
			return res.end();

		invoicesModel.find({
			partnerid : {
				$in : aPartners
			}
		}).lean().exec(function(err, invoices) {

			if (err)
				return res.status(500).send(err);

			// add some fields in order

			var pInvoices = new Promise(function(resolve, reject) {
				var aProm = [];
				for (var s = 0; s < invoices.length; s++) {
					var oDoc = invoices[s];

					aProm.push(_getInvoice(oDoc));

				}

				Promise.all(aProm).then(function(aDocs) {
					resolve(invoices);
				});

			});

			// send data
			pInvoices.then(function(invoices) {

				// final corrections
				for (d = 0; d < invoices.length; d++) {
					invoices[d].approvable = false;
				}

				// return results
				res.write(JSON.stringify({
					invoices : invoices
				}));
				return res.end();
			});

		});
	});
};

getIncInvoices = function() {
};
getInvoiceDetails = function() {
};

// ----private functions
_getInvoice = function(oInvoice) {
	return new Promise(function(resolve, reject) {

		var aPromises = [];

		// partnername
		aPromises.push(mPartner.getPartnerById(oInvoice.partnerid).then(
				function(oPartner) {
					oInvoice.partnername = oPartner.partnername;
				}));

		// parties
		aPromises.push(mPartner.getDocParties(oInvoice.parties).then(
				function(aParties) {
					oInvoice.parties = aParties;
				}));

		// Approvals
		aPromises.push(mApprove.getDocApprovals(oInvoice.approval).then(
				function(aApprovals) {
					oInvoice.approval = aApprovals;
				}));

		// Resolve
		Promise.all(aPromises).then(function(oObjects) {
			resolve(oInvoice);
		});

	});
};

module.exports.maintainInvoice = maintainInvoice;
module.exports.getOwnInvoices = getOwnInvoices;
module.exports.getIncInvoices = getIncInvoices;
module.exports.getInvoiceDetails = getInvoiceDetails;