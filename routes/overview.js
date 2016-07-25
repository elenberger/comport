var ordersModel = require('./dbwrapper').ordersModel;
var invoicesModel = require('./dbwrapper').invoicesModel;
var getUser = require('./users').getUser;

overview = function(req, res) {

	res.setHeader("Content-Type", "application/json");

	// get user data. determine partners and available roles

	getUser(req).then(
			function(oUser) {
				var aPartners = [];
				var aProm = [];
				var oRes = {};

				// Partners
				if (oUser.partners) {
					for (var i = 0; i < oUser.partners.length; i++) {
						aPartners.push(oUser.partners[i].partner.partnerid);
					}
				}
				if (aPartners.length == 0)
					res.end({});

				// Roles
				if (oUser.roles) {
					for (var i = 0; i < oUser.roles.length; i++) {
						switch (oUser.roles[i]) {
						case "AP-ORD":
							aProm.push(overviewMyOrders(aPartners).then(
									function(oDoc) {
										oRes.apord = oDoc;
									}));
							break;
						case "AP-INV":
							aProm.push(overviewIncInvoices(aPartners).then(
									function(oDoc) {
										oRes.apinv = oDoc;
									}));
							break;
						case "AR-ORD":
							aProm.push(overviewIncOrders(aPartners).then(
									function(oDoc) {
										oRes.arord = oDoc;
									}));
							break;
						case "AR-INV":
							aProm.push(overviewMyInvoices(aPartners).then(
									function(oDoc) {
										oRes.arinv = oDoc;
									}));
							break;
						default:
							break;
						}
					}
				}

				// return results

				Promise.all(aProm).then(function(oDocs) {

					res.write(JSON.stringify(oRes));
					return res.end();

				});

			});
};

overviewMyOrders = function(aPartners) {

	return new Promise(function(resolve, reject) {

		ordersModel.find({
			partnerid : {
				$in : aPartners
			}
		}).lean().exec(
				function(err, orders) {

					if (err)
						resolve({});

					var oRes = {
						iAll : 0,
						iApproved : 0,
						iRejected : 0
					};

					for (var i = 0; i < orders.length; i++) {

						if (orders[i].stat === "Approval"
								|| orders[i].stat === "Approved"
								|| orders[i].stat === "Rejected")
							oRes.iAll = oRes.iAll + 1;

						if (orders[i].stat === "Approved")
							oRes.iApproved = oRes.iApproved + 1;

						if (orders[i].stat === "Rejected")
							oRes.iRejected = oRes.iRejected + 1;

					}

					resolve(oRes);

				});
	});
};

overviewIncOrders = function(aPartners) {

	return new Promise(function(resolve, reject) {

		ordersModel.find({
			'parties.partnerid' : {
				$in : aPartners
			}
		}).lean().exec(
				function(err, orders) {

					if (err)
						resolve({});

					var oRes = {
						iAll : 0,
						iApproved : 0,
						iRejected : 0
					};

					for (var i = 0; i < orders.length; i++) {

						if (orders[i].stat === "Approval"
								|| orders[i].stat === "Approved"
								|| orders[i].stat === "Rejected")
							oRes.iAll = oRes.iAll + 1;

						if (orders[i].stat === "Approved")
							oRes.iApproved = oRes.iApproved + 1;

						if (orders[i].stat === "Rejected")
							oRes.iRejected = oRes.iRejected + 1;

					}

					resolve(oRes);

				});
	});
};

overviewMyInvoices = function(aPartners) {

	return new Promise(function(resolve, reject) {

		invoicesModel.find({
			partnerid : {
				$in : aPartners
			}
		}).lean().exec(
				function(err, docs) {

					if (err)
						resolve({});

					var oRes = {
						iAll : 0,
						iApproved : 0,
						iRejected : 0
					};

					for (var i = 0; i < docs.length; i++) {

						if (docs[i].stat === "Approval"
								|| docs[i].stat === "Approved"
								|| docs[i].stat === "Rejected"
								|| docs[i].stat === "Sent"
								|| docs[i].stat === "Error")
							oRes.iAll = oRes.iAll + 1;

						if (docs[i].stat === "Approved"
								|| docs[i].stat === "Sent")
							oRes.iApproved = oRes.iApproved + 1;

						if (docs[i].stat === "Rejected"
								|| docs[i].stat === "Error")
							oRes.iRejected = oRes.iRejected + 1;

					}

					resolve(oRes);

				});
	});
};

overviewIncInvoices = function(aPartners) {

	return new Promise(function(resolve, reject) {

		invoicesModel.find({
			'parties.partnerid' : {
				$in : aPartners
			}
		}).lean().exec(
				function(err, docs) {

					if (err)
						resolve({});

					var oRes = {
						iAll : 0,
						iApproved : 0,
						iRejected : 0
					};

					for (var i = 0; i < docs.length; i++) {

						if (docs[i].stat === "Approval"
								|| docs[i].stat === "Approved"
								|| docs[i].stat === "Rejected"
								|| docs[i].stat === "Sent"
								|| docs[i].stat === "Error")
							oRes.iAll = oRes.iAll + 1;

						if (docs[i].stat === "Approved"
								|| docs[i].stat === "Sent")
							oRes.iApproved = oRes.iApproved + 1;

						if (docs[i].stat === "Rejected"
								|| docs[i].stat === "Error")
							oRes.iRejected = oRes.iRejected + 1;

					}

					resolve(oRes);

				});
	});
};

module.exports.overview = overview;