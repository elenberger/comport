

var invoicesModel = require('./dbwrapper').invoicesModel;
var ordersModel = require('./dbwrapper').ordersModel;
var workflowsModel = require('./dbwrapper').workflowsModel;

var rest = require('./restcallwrapper');

var emailer = require('./emailer');

var mPartner = require('./partners');

var getUser = require('./users').getUser;
var mApprove = require('./approve');

maintainInvoice = function (req, res) {
	// get operation, num, partnerid, order from request.

	var sOper = req.body.operation;

	if (req.body.invoice) {
		var sInvoicenum = req.body.invoice.num;
		var sPartnerid = req.body.invoice.partnerid;
		var sOrder = req.body.invoice.order;
	}

	if (!sOper || !sInvoicenum || !sPartnerid || !sOrder) {
		return res.status(200).send({
			"error": "Wrong message format"
		});
	}

	// find invoice and check status.
	invoicesModel.findOne({
		partnerid: sPartnerid,
		num: sInvoicenum
	}).exec(function (err, invoice) {

		if (err)
			return res.status(200).send({
				"error": "Error while creating invoice"
			});

		switch (sOper) {

			case "C":
				if (invoice) {
					return res.status(200).send({
						"error": "Invoice exists!"
					});
				}

				addInvoice(req.body.invoice, req, res);

				break;
			case "U":
				// remove old invoice and create new only if it is still in Approval
				// or Archived
				if (invoice) {
					invoice.remove(function (err, removed) {
					});
				}
				addInvoice(req.body.invoice, req, res);

				break;
			case "D":
				if (invoice) {
					invoice.remove(function (err, removed) {
						res.end();
					});
				} else {
					res.send({
						"error": "Invoice doesn't exists"
					});
				}
				break;
			case "A": //Approve
			case "R":
				mApprove.approveInvoice(req, res, invoice);
				break;
			case "P": //update posting information
				updatePostingInfo(req, res, invoice);
				break;
			case "X": //send to external system
				sendInvoiceExt(req, res);
				break;
			default:
				return res.status(200).send({
					"error": "Wrong message format"
				});

		}
	});
};


findPartyPartnerId = function (aParties, sRole) {
	for (i = 0; i < aParties.length; i++) {
		if (sRole == aParties[i].role) {
			return aParties[i].partnerid;
		}
	}
	return "";
};

addInvoice = function (oInvoice, req, res) {

	// logic before save

	invoicesModel.schema.pre('save', function (next) {
		if (this.num.length > 10) {
			var error = new ValidationError(this);
			error.errors.num = new ValidatorError('num',
				'length for number is invalid', 'notvalid', this.num);
			return next(error);
		}
        if (!this.stat) this.stat = 'Approval';

		var oInvoice = this;

        //in case appoval already here - skip next code
        if (oInvoice.approval.length > 0) return next();


		// init approval procedure

		workflowsModel.findOne({
			wfid: "dummyinv"
		}).lean().exec(
			function (err, workflow) {
				if (err)
					res.status(500).send({
						"error": "Workflow procedure is not determined"
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

						// data for email
						var oMailParams = {
							num: oInvoice.num,
							partnerid: oInvoice.partnerid,
							sendto: oInvoiceWorkflowStep.partnerid,
							doctype: 'Invoice'
						}
						//send email async
						setTimeout(function () {
							emailer.sendDocApproveMsg(req, oMailParams)
						}, 10000);

					}

					oInvoice.approval.push(oInvoiceWorkflowStep);
				}

				// Last step is notification to Invoice owner
				var oInvoiceWorkflowStep = {
					stepno: i + 1,
					steptype: "N",
					partnerid: oInvoice.partnerid
				};
				oInvoice.approval.push(oInvoiceWorkflowStep);

				next();
			});

	});

	// Determine Bill-to party
	var oBilltoParty = oInvoice.parties.find(function (oParty) {
		if (oParty.role === 'Billto') {

			return oParty;

		}
	});

	if (!oBilltoParty)
		return res.status(200).send({
			"error": "Bill-to party is not determined"
		});

	// validate\get PO reference and create invoice

	sBillto = oBilltoParty.partnerid;
	sOrdernum = oInvoice.order;

	ordersModel.findOne({
		partnerid: sBillto,
		num: sOrdernum
	}).exec(function (err, order) {

		if (err || !order)
			return res.status(200).send({
				"error": "Reference order not found"
			});

		oInvoice.order = order;

		invoicesModel.create(oInvoice, function (err, invoice) {

			if (err)
				res.status(200).send({
					"error": "Invoice is not created"
				});

			return res.send(invoice);

		});
	});

};

getOwnInvoices = function (req, res) {
	res.setHeader("Content-Type", "application/json");

	// get partnerid's which can see user.
	getUser(req).then(function (oUser) {
		var aPartners = [];
		if (oUser.partners) {
			for (i = 0; i < oUser.partners.length; i++) {
				aPartners.push(oUser.partners[i].partner.partnerid);
			}
		}

		if (aPartners.length == 0)
			return res.end();

		invoicesModel.find({
			partnerid: {
				$in: aPartners
			}
		}).populate('order').lean().exec(function (err, invoices) {

			if (err)
				return res.status(200).send(err);

			// add some fields in order

			var pInvoices = new Promise(function (resolve, reject) {
				var aProm = [];
				for (var s = 0; s < invoices.length; s++) {
					var oDoc = invoices[s];

					aProm.push(_getInvoice(oDoc));

				}

				Promise.all(aProm).then(function (aDocs) {
					resolve(invoices);
				});

			});

			// send data
			pInvoices.then(function (invoices) {

				// final corrections
				for (d = 0; d < invoices.length; d++) {
					invoices[d].approvable = false;
				}

				// return results
				res.write(JSON.stringify({
					docs: invoices
				}));
				return res.end();
			});

		});
	});
};

getIncInvoices = function (req, res) {

	res.setHeader("Content-Type", "application/json");

	// get partnerid's which can see user.
	getUser(req).then(function (oUser) {
		var aPartners = [];
		if (oUser.partners) {
			for (i = 0; i < oUser.partners.length; i++) {
				aPartners.push(oUser.partners[i].partner.partnerid);
			}
		}

		if (aPartners.length == 0)
			return res.status(200).send({});

		invoicesModel.find({
			'parties.partnerid': {
				$in: aPartners
			}
		}).populate('order').lean().exec(function (err, invoices) {

			if (err)
				return res.status(500).send({
					"error": "Error while reading invoices"
				});

			// add some fields into invoice

			var aProm = [];
			for (var s = 0; s < invoices.length; s++) {
				var oDoc = invoices[s];

				aProm.push(_getInvoice(oDoc));

			}

			// final corrections, calculate if document approvable

			Promise.all(aProm).then(function (invoices) {

				for (var d = 0; d < invoices.length; d++) {
					var oInvoice = invoices[d];
					oInvoice.approvable = false;

					var oRes = oInvoice.approval.find(function (oApprovalStep) {
						if (oApprovalStep.approve) {
							return oApprovalStep
						}
					});

					if (oRes) {
						var sPartnerid = aPartners.find(function (sPartnerid) {
							if (sPartnerid == oRes.partnerid) {
								return sPartnerid;
							}
						});
						if (sPartnerid) {
							oInvoice.approvable = true;
						}
					}

				}

				// return results
				res.write(JSON.stringify({
					docs: invoices
				}));
				return res.end();
			});

		});
	});

};

getInvoiceDetails = function () {
};

// ----private functions
_getInvoice = function (oInvoice) {
	return new Promise(function (resolve, reject) {

		var aPromises = [];

		//Modify status text
		if (oInvoice.stat === 'Approval') oInvoice.stat = 'Pending approval';

		// partnername
		aPromises.push(mPartner.getPartnerById(oInvoice.partnerid).then(
			function (oPartner) {
				oInvoice.partnername = oPartner.partnername;
			}));

		// parties
		aPromises.push(mPartner.getDocParties(oInvoice.parties).then(
			function (aParties) {
				oInvoice.parties = aParties;
			}));

		// Approvals
		aPromises.push(mApprove.getDocApprovals(oInvoice.approval).then(
			function (aApprovals) {
				oInvoice.approval = aApprovals;
			}));

		// Resolve
		Promise.all(aPromises).then(function (oObjects) {
			resolve(oInvoice);
		});

	});
};

getInvoiceDetails = function (req, res) {

	// Object to retrieve and push Invoice details
	res.setHeader("Content-Type", "application/json");

	var sId = req.params.id;

	rest.performGetRequest("/sap/bc/rest/z_comport/inv/" + sId, "",
		// success
		function (bkndres) {

			res.write(JSON.stringify({
				invoiceDetails: bkndres
			}));

			return res.end();

		},
		// on error
		function (error) {
			return res.status(200).send({
				"error": "Error while requesting data from backend"
			});

		});

};

// Return invoice from external system
getInvoiceDetails = function (req, res) {

	// Object to retrieve and push Invoice details
	res.setHeader("Content-Type", "application/json");

	var sId = req.params.num;
	getInvoiceExtSys(sId).then(function (oInvoice) {

		return res.status(200).send(JSON.stringify({
			invoiceDetails: oInvoice
		}));
	}, function (err) {
		return res.status(500).send({
			"error": "Error while requesting data from backend"
		});
	});

};

// Get InvoiceDetailsExt with all details from external system
getInvoiceExtSys = function (sId) {

	return new Promise(function (resolve, reject) {

		rest.performGetRequest("/sap/bc/rest/z_comport/invoices/" + sId, "",
			// success
			function (bkndres) {
				resolve(bkndres);
			},
			// on error
			function (error) {
				reject(error);
			});
	});

};

// Send Invoice to external system
sendInvoiceExt = function (req, res) {

	"use strict";

	// at first get invoice from remote system(we require it as have no position
	// in comport)

	var oParams = {
		num: req.body.invoice.num,
		partnerid: req.body.invoice.partnerid
	};

	getInvoiceExtSys(oParams.num).then(
		// Success
		function (oInvoice) {

			// map properties

			var oObject = {};

			oObject.partnerid = oInvoice.partnerid;
			oObject.invdate = oInvoice.date;
			oObject.num = oInvoice.num;
			oObject.currency = oInvoice.currency;
			oObject.invnote = oInvoice.note;
			oObject.refnum = oInvoice.order;

			oObject.positions = [];

			for (var j = 0; j < oInvoice.positions.length; j++) {
				oObject.positions.push({
					text: oInvoice.positions[j].postxt,
					sum: oInvoice.positions[j].netamount
				});
			}

			// send to RECEIVER

			rest.performPostRequestSAP("/sap/bc/rest/z_comport/incinvoices", oObject,
				// success
				function (oResponse) {

					var oUpdate = {
						posting: "Sent",
						lastMsg: "",
						partnerid: oInvoice.partnerid,
						num: oInvoice.num
					};

					for (let oMsg of oResponse.response) {
						if (oMsg.type = 'E') {
							oUpdate.posting = 'Error';
							oUpdate.lastMsg = oMsg.message;
							break;
						}
					}

					// Update Invoice Status async
					updateInvoiceStatus(oUpdate);

					return res.status(200).send(JSON.stringify(oUpdate));


				},
				// on error Receiver
				function (error) {

					// Update Invoice Status
					var oUpdate = {
						posting: "Error",
						lastMsg: "Server error",
						partnerid: oInvoice.partnerid,
						num: oInvoice.num
					}
					updateInvoiceStatus(oUpdate);

					return res.status(200).send(error);

				});

		},
		// Reject ->invoice is not received from Sender
		function (err) {
			return res.status(200).send({
				"error": "Error while requesting data from backend"
			});
		});

};

updateInvoiceStatus = function (oUpdate) {
	var oInvObjectNew = {
		posting: oUpdate.posting,
		lasterr: oUpdate.lastMsg

	};

	invoicesModel.findOneAndUpdate(
		{
			partnerid: oUpdate.partnerid,
			num: oUpdate.num
		},
		oInvObjectNew,
		{ new: true },
		function (err, oUpdInvoice) {
			// TODO: check if invoice was updated
		}
	);
};

updatePostingInfo = function (req, res, oInvoice) {

	   var oMessage = req.body.invoice;

	   if (oMessage.posting !== 'Posted' && oMessage.posting !== 'Error')
	       return res.status(200).send({
			"error": "Wrong message format"
		});

	   oInvoice.posting = oMessage.posting;

	   if (oMessage.posting === 'Posted' && oMessage.extdocument) {
		oInvoice.extdocument = oMessage.extdocument;
		oInvoice.lasterr = "";
	   }

	   if (oMessage.posting === 'Error' && oMessage.lasterr) {
		oInvoice.extdocument = "";
		oInvoice.lasterr = oMessage.lasterr;
	   }

	oInvoice.save(function (err) {
		if (err)
			return res.status(200).send({
				"error": "Operation cancelled"
			});

		// send message 

		res.status(200).send({
			"message": "Posting information successfully updated"
		});

        var oParty = oInvoice.parties.find(function (oParty) {
			if (oParty.role === 'Billto') return oParty;
		});

		if (!oParty) return;

		var oMailParams = {
			num: oInvoice.num,
			partnerid: oInvoice.partnerid,
			sendto: oParty.partnerid,
			posting: oInvoice.posting,
			doctype: 'Invoice'
		}

		setTimeout(function () {
			emailer.sendInvoicePostingMsg(req, oMailParams);
		}, 10000);

	});
};

module.exports.maintainInvoice = maintainInvoice;
module.exports.getOwnInvoices = getOwnInvoices;
module.exports.getIncInvoices = getIncInvoices;
module.exports.getInvoiceDetails = getInvoiceDetails;
