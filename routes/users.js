var usersModel = require('./dbwrapper').usersModel;
var partnersModel = require('./dbwrapper').partnersModel;
var basicAuth = require('basic-auth');

maintainUser = function(req, res) {
    res.setHeader("Content-Type", "application/json");

    // check if user Administrator

    getUser(req).then(
        // user Found
        function(oUser) {

            var sRole = oUser.roles.find(function(sRole) {
                if (sRole === 'ADMINISTRATOR')
                    return sRole;
            })

            if (!sRole)
                return res.status(200).send({
                    "message": "No autorization"
                });

            var sOperation = req.body.operation;
            var oUser = req.body.user;

            if (!sOperation || !oUser)
                return res.status(200).send({
                    "message": "Wrong message format"
                });

            switch (sOperation) {
                case 'C':
                case 'U':
                    createUser(res, oUser);
                    break;
                case 'D':
                    deleteUser(res, oUser);
                    break;
                default:
                    return res.status(200).send({
                        "message": "Wrong message format"
                    });
                    break;
            }
        },
        // error->User not found
        function(err) {
            return res.status(500).send({
                "error": "unknown error"
            });
        });

};

createUser = function(res, oUser) {
    usersModel.findOneAndUpdate({
            userid: oUser.userid
        },
        oUser, {
            new: true,
            upsert: true
        },
        function(err, oNewUser) {

            if (err) return res.status(200).send({
                "error": "Error during user creation "
            });

            return res.status(200).send(oNewUser.toObject());

        }
    );

};

deleteUser = function(res, oUser) {
    usersModel.findOneAndRemove({
            userid: oUser.userid
        },
        function(err, oDelUser) {

            if (err) return res.status(200).end(JSON.stringify({
                "error": "Error during user deletion "
            }));

            return res.status(200).end(JSON.stringify({
                "message": "User has been successfully deleted"
            }));

        }
    );
};

getUserList = function(req, res) {

    res.setHeader("Content-Type", "application/json");

    usersModel.find({}).populate('partners.partner').lean().exec(
        function(err, users) {
            if (!err) {

                // remove pass.
                for (i = 0; i < users.length; i++) {
                    delete users[i].pass;
                }
            }
            res.write(JSON.stringify({
                users: users
            }));

            return res.end();
        });
}

getUser = function(req) {

        var user = basicAuth(req);

        return new Promise(function(resolve, reject) {

            usersModel.findOne({
                userid: user.name
            }).populate('partners.partner').lean().exec(function(err, dbuser) {

                if ((err) || (!dbuser))
                    return reject(err);

                resolve(dbuser);

            });

        });
    },

    assignPartner = function(req, res) {

        //Format: {userid: userid,
        //         partners: [partnerid]}
        var sUser = req.body.userid;
        var aPartners = req.body.partners;

        if (!sUser || !aPartners) return res.status(500).send({
            "error": "Wrong message format"
        });

        partnersModel.find({
            partnerid: {
                $in: aPartners
            }
        }).exec(function(err, aDbPartners) {

            if ((err) || (!aDbPartners))
                return res.end({
                    "error": "partner not found"
                });

            var aUpdUserPartners = [];
            for (var i = 0; i < aDbPartners.length; i++) {

                aUpdUserPartners.push({
                    partner: aDbPartners[i]
                });
            }

            var oUpdUser = {
                partners: aUpdUserPartners
            }


            usersModel.findOneAndUpdate({
                    userid: sUser
                },
                oUpdUser, {
                    new: true,
                    upsert: true
                },
                function(err, oUpdUser) {

                    if (err) return res.send({
                        "error": "Error during partner update"
                    });
                    return res.send(oUpdUser.toObject());

                });
        });

    }



validatePartner = function(req, partnerid) {

        return new Promise(function(resolve, reject) {

                //  helper function
                var fDetermine = function(oUser, partnerid) {

                    if (!oUser.partners) return false;

                    var oUserPartner = oUser.partners.find(function(oUserPartner) {
                        if (oUserPartner.partner.partnerid === partnerid)
                            return oUserPartner.partner;

                    });

                    if (oUserPartner) return true;
                    else return false;

                }

                //  main
                if (req._oUser) resolve(fDetermine(req._oUser, partnerid));
                else getUser(req).then(function(oUser) {
                        resolve(fDetermine(oUser, partnerid));
                    });

                });
        };

        // module.exports.addRecord = addRecord;
        module.exports.maintainUser = maintainUser;
        module.exports.getUserList = getUserList;
        module.exports.getUser = getUser;
        module.exports.assignPartner = assignPartner;
        module.exports.validatePartner = validatePartner;
