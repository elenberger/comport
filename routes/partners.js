var db = require('./dbwrapper');

getList = function(req, res) {

	res.setHeader("Content-Type", "application/json");

	db.partnersModel.find({}).lean().exec(function(err, partners) {
		if (!err) {

			res.write(JSON.stringify({
				partners : partners
			}));

		}

		return res.end();

	});
};

getPartnerById = function(sPartner) {

	return new Promise(function(resolve, reject) {
		db.partnersModel.findOne({
			partnerid : sPartner
		}).lean().exec(function(err, partner) {
			resolve(partner);
		})
	});

};

getDocParties = function(aParties) {

	return new Promise(function(resolve, reject) {

		var aPromises = [];

		for (var p = 0; p < aParties.length; p++) {
			var oParty = aParties[p];

			aPromises.push(getPartnerById(oParty.partnerid).then(
					function(oPartner) {
						oParty.partnername = oPartner.partnername;
					}));

		}

		Promise.all(aPromises).then(function(aObjects) {
			resolve(aParties);
		});

	});
};

maintainPartner = function(req, res) {
	
	res.setHeader("Content-Type", "application/json");

	var sOper = req.body.operation;
	var oPartner = req.body.partner;
	
	switch (sOper) {
	
	case "C":
		addPartner(req, res);
		break;

	case "U":
				
        db.partnersModel.findOneAndUpdate(
				{partnerid: oPartner.partnerid},
				oPartner,
				{new: true},
		function(err, oUpdPartner) {
					if (err) 
						return  res.status(500).send({"error": "Partner update failed"});
					
					return res.status(200).send(JSON.stringify(oUpdPartner.toObject()));
				}		
		);
		break;
		
	case "D":
		db.partnersModel.findOneAndRemove(
				{partnerid: oPartner.partnerid},
		function(err, oDelPartner) {
					if (err) 
						return  res.status(500).send({"error": "Partner not deleted"});
					
					return res.status(200).send({"message": "partner was successfullly deleted"});
				}		
		);
		break;

	default:
		return  res.status(500).send({"error": "Wrong message!"});
		break;
	}

};

addPartner = function(req, res) {

	// Check user authorization

	// gen ID and create
	var oPartner = req.body.partner;

	db.getNextId("partnerid").then(
	// resolve
	function(sId) {

		oPartner.partnerid = sId;

		db.partnersModel.create(oPartner, function(err, oObj) {

			if (err)
				return res.status(500).send({
					"error" : "error while creating partner"
				});
			res.status(200).send(JSON.stringify(oObj.toObject()));
		});

	},
	// reject
	function(err) {
		if (err)
			return res.status(500).send({
				"error" : "error while creating partner ID"
			});
	});

};

module.exports.getPartnerById = getPartnerById;
module.exports.getDocParties = getDocParties;
module.exports.getList = getList;
module.exports.maintainPartner = maintainPartner;
