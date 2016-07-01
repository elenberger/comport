var partnersModel = require('./dbwrapper').partnersModel;

getList = function(req, res) {

	res.setHeader("Content-Type", "application/json");

	partnersModel.find({}).lean().exec(function(err, partners) {
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
		partnersModel.findOne({
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


module.exports.getPartnerById = getPartnerById;
module.exports.getDocParties  = getDocParties;
module.exports.getList        = getList;
