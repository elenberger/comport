var basicAuth = require('basic-auth');
var emailer = require('./emailer');
var getUser = require('./users').getUser;
var mUser = require('./users');

// process approval array
getDocApprovals = function(aApprovals) {

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

approveOrder = function(req, res, oOrder) {

	if (oOrder.stat !== 'Approval') {
		return res.status(500).send({
			"message" : "Operation is not possible"
		});
	}

	var bSuccess = false;
	var sOper = req.body.operation;

	var oResStep = oOrder.approval.find(function(oApprovalStep) {
		if (!oApprovalStep.resdate && oApprovalStep.steptype == 'A') {

			return oApprovalStep;

		}
	});

	if (!oResStep) {
		res.status(200).send({
			"message" : "Operation cancelled"
		});
	}

	getUser(req)
			.then(
					function(oUser) {
						if (oUser.partners) {

							var sPartnerid = oUser.partners
									.find(function(oUserPartner) {
										if (oUserPartner.partner.partnerid == oResStep.partnerid) {
											return oUserPartner.partner.partnerid;
										}
									});

							// If order ready to be approved
							if (sPartnerid) {
								oResStep.resdate = Date.now();
								oResStep.resolver = oUser.userid;
								
								bSuccess = true;
								if (req.body.order.note) {
									oResStep.note = req.body.order.note;
								}

							}

						}

						// if Approve-> following actions

						if (sOper == 'A') {
							var bCompleted = true;

							for (var a = 0; a < oOrder.approval.length; a++) {

								if (!oOrder.approval[a].resdate
										&& oOrder.approval[a].steptype == 'A') {
									bCompleted = false;
									break;
								}
								if (!oOrder.approval[a].resdate
										&& oOrder.approval[a].steptype == 'N') {
																		
									oOrder.approval[a].resdate = Date.now();
									oOrder.approval[a].resolver = 'automatically';
									
									// Notification\email
									var oMailParams = {num: oOrder.num, partnerid: oOrder.partnerid, sendto: oOrder.approval[a].partnerid}
								    
									
								}
							}
						}

						// Update order status

						if (bSuccess && bCompleted) {
							oOrder.stat = "Approved";
						} else if (bSuccess && sOper == 'R') {
							oOrder.stat = "Rejected";
						}

						//

						if (bSuccess) {
							
							if (oMailParams) {
								oMailParams.stat = oOrder.stat;
								emailer.sendOrderInfoMsg(req, oMailParams);
							}
							
							oOrder
									.save(function(err) {
										if (err) {
											res
													.status(500)
													.send(
															{
																"message" : "Operation cancelled"
															});
										}
										res
												.status(200)
												.send(
														{
															"message" : "Operation completed successfully"
														});

									});

						} else {
							res.status(500).send({
								"message" : "Operation cancelled"
							});
						}

					});

};

approveInvoice = function(req, res, oInvoice) {


	approveDoc(req, oInvoice).then(
	// resolve
	function(oMsg) {

		oInvoice.save(function(err) {
			if (err)
				return res.status(500).send({
					"message" : "Operation cancelled"
				});

			return res.status(200).send({
				"message" : "Operation completed successfully"
			});
		});
	},
	// reject
	function(oErr) {
		return res.status(500).send({
			"message" : "Operation cancelled"
		});
	});

};

approveDoc = function(req, oDoc) {

	return new Promise(function(resolve, reject) {
        
		var sUserid = basicAuth(req).name;
		
        if (oDoc.stat !== 'Approval')
			reject({
				"error" : "document is not in approval step"
			});

		var bSuccess = false;
		var sOper = req.body.operation;

		var oResStep = oDoc.approval.find(function(oApprovalStep) {
			if (!oApprovalStep.resdate && oApprovalStep.steptype == 'A') {

				return oApprovalStep;

			}
		});

		if (!oResStep) {
			reject({
				"error" : "document is not in approval step"
			});
		}

		mUser.validatePartner(req, oResStep.partnerid).then(
				function(bAllowed) {

					if (!bAllowed)
						reject({
							"error" : "You are not allowed to approve document"
						});

					oResStep.resdate = Date.now();
					oResStep.resolver = sUserid;
					bSuccess = true;
					if (req.body.invoice.note)
						oResStep.note = req.body.invoice.note;

					// if Approve-> following actions

					if (sOper == 'A') {
						var bCompleted = true;

						for (var a = 0; a < oDoc.approval.length; a++) {

							if (!oDoc.approval[a].resdate
									&& oDoc.approval[a].steptype == 'A') {
								bCompleted = false;
								break;
							}
							if (!oDoc.approval[a].resdate
									&& oDoc.approval[a].steptype == 'N') {
								// Notification\email should be send here
								oDoc.approval[a].resdate = Date.now();
								oDoc.approval[a].resolver = sUserid;
							}
						}
					}

					// Update document status

					if (bSuccess && bCompleted) {
						oDoc.stat = "Approved";
					} else if (bSuccess && sOper == 'R') {
						oDoc.stat = "Rejected";
					}

					if (bSuccess) {
						resolve({
							"message" : "Operation completed successfully"
						});
					} else {
						reject({
							"message" : "Operation cancelled"
						});
					}

				});
	});

};

module.exports.getDocApprovals = getDocApprovals;
module.exports.approveOrder = approveOrder;
module.exports.approveInvoice = approveInvoice;