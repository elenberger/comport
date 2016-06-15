var usersModel = require('./dbwrapper').usersModel;
var partnersModel = require('./dbwrapper').partnersModel;
var basicAuth = require('basic-auth');

getList = function(req, res) {

	res.setHeader("Content-Type", "application/json");

	usersModel.find({}).populate('partners.partner').lean().exec(function(err, users) {
		if (!err) {

			// get partnername.
			 for (i=0;i<users.length;i++){
			 delete users[i].pass;
			// var sRoles = users[i].roles.join();
			// users[i].roles = sRoles;
			 }
			//	 if (users[i].roles) {
			// var aRoles = users[i].roles;
			// var aRolesNew = [];
			// for (j=0; j<aRoles.length; j++) {
			// aRolesNew.push({"key":aRoles[j]});
			// }
			// users[i].roles = aRolesNew;
			// }
			// }

			res.write(JSON.stringify({
				users : users
			}));

		}

		return res.end();

	});
}

getUser = function(req, res) {

	var user = basicAuth(req);

	return new Promise(function(resolve, reject) {

		usersModel.findOne({
			userid : user.name
		}).populate('partners.partner').lean().exec(function(err, dbuser) {

			if ((err) || (!dbuser))
				return reject(err);

			resolve(dbuser);

		});

	});
},

assignPartner = function(req, res) {

	var sUser = req.body.userid;
	var sPartnerid  = req.body.partnerid;
	
	usersModel.findOne({
		userid : sUser
	}).exec(function(err, dbuser) {

		if ((err) || (!dbuser))
			return res.end(err);

		partnersModel.findOne({
			partnerid : sPartnerid
		}).exec(function(err, dbpartner) {

			if ((err) || (!dbpartner))
				return res.end(err);

			dbuser.partners.push({
				partner : dbpartner
			});
			
			dbuser.save(function(err) {
				if (err)
					return res.end(err);
				return res.end();
			});

		});

	});

};

// module.exports.addRecord = addRecord;
module.exports.getList = getList;
module.exports.getUser = getUser;
module.exports.assignPartner = assignPartner;