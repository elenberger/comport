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
},

getPartnerById = function(sPartner) {

	return new Promise(function(resolve,reject) {
		partnersModel.findOne({partnerid : sPartner}).lean().exec(
				function(err, partner) {
		             resolve(partner);
	}) 
	});

}

 module.exports.getPartnerById = getPartnerById;
module.exports.getList = getList;