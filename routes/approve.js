var getUser = require('./users').getUser;


//process approval array
getDocApprovals = function(aApprovals) {

	return new Promise(function(resolve, reject) {

		var aStepProm = [];
		var bActiveStepFound = false;
		
		for (var a = 0; a < aApprovals.length; a++) {

			var oStepProm = new Promise(function(resolve, reject) {
				var oApprovalStep = aApprovals[a];
				getPartnerById(oApprovalStep.partnerid).then(function(oPartner) {
										
					oApprovalStep.partnername = oPartner.partnername;
					oApprovalStep.approve = false;
					
					if (!oApprovalStep.resdate && !bActiveStepFound) {
						oApprovalStep.approve = bActiveStepFound =  true;
						
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

	getUser(req, res)
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
								bSuccess = true;
								if (req.body.order.note) {
									oResStep.note = req.body.order.note;
								}
								
	

							}

						}

						// if Approve-> following actions 
                        
						if (sOper == 'A'){
						var bCompleted = true;

						for (var a = 0; a < oOrder.approval.length; a++) {

							if (!oOrder.approval[a].resdate
									&& oOrder.approval[a].steptype == 'A') {
								bCompleted = false;
								break;
							}
							if (!oOrder.approval[a].resdate
									&& oOrder.approval[a].steptype == 'N') {
								// Notification\email should be send here
								oOrder.approval[a].resdate = Date.now();
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
   
//	if (oOrder.stat !== 'Approval') {
//		return res.status(500).send({
//			"message" : "Operation is not possible"
//		});
//	}
//
//	var bSuccess = false;
//	var sOper = req.body.operation;
//
//	var oResStep = oOrder.approval.find(function(oApprovalStep) {
//		if (!oApprovalStep.resdate && oApprovalStep.steptype == 'A') {
//
//			return oApprovalStep;
//
//		}
//	});
//
//	if (!oResStep) {
//		res.status(200).send({
//			"message" : "Operation cancelled"
//		});
//	}
//
//	getUser(req, res)
//			.then(
//					function(oUser) {
//						if (oUser.partners) {
//
//							var sPartnerid = oUser.partners
//									.find(function(oUserPartner) {
//										if (oUserPartner.partner.partnerid == oResStep.partnerid) {
//											return oUserPartner.partner.partnerid;
//										}
//									});
//
//							// If order ready to be approved
//							if (sPartnerid) {
//								oResStep.resdate = Date.now();
//								bSuccess = true;
//								if (req.body.order.note) {
//									oResStep.note = req.body.order.note;
//								}
//								
//								
//
//							}
//
//						}
//
//						// if Approve-> following actions
//                        
//						if (sOper == 'A'){
//						var bCompleted = true;
//
//						for (var a = 0; a < oOrder.approval.length; a++) {
//
//							if (!oOrder.approval[a].resdate
//									&& oOrder.approval[a].steptype == 'A') {
//								bCompleted = false;
//								break;
//							}
//							if (!oOrder.approval[a].resdate
//									&& oOrder.approval[a].steptype == 'N') {
//								// Notification\email should be send here
//								oOrder.approval[a].resdate = Date.now();
//							}
//						}
//						}
//						
//						// Update order status
//						 
//						if (bSuccess && bCompleted) {
//							oOrder.stat = "Approved";
//						} else if (bSuccess && sOper == 'R') {
//							oOrder.stat = "Rejected";
//						}
//
//						//
//
//						if (bSuccess) {
//							oOrder
//									.save(function(err) {
//										if (err) {
//											res
//													.status(500)
//													.send(
//															{
//																"message" : "Operation cancelled"
//															});
//										}
//										res
//												.status(200)
//												.send(
//														{
//															"message" : "Operation completed successfully"
//														});
//
//									});
//
//						} else {
//							res.status(500).send({
//								"message" : "Operation cancelled"
//							});
//						}
//
//					});

};
module.exports.getDocApprovals = getDocApprovals;
module.exports.approveOrder    = approveOrder;
module.exports.approveInvoice  = approveInvoice;