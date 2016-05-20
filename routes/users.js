var usersModel = require('./dbwrapper').usersModel;

getList = function (req, res) {

    res.setHeader("Content-Type", "application/json");

    usersModel.find({}, function (err, users) {
        if (!err) {

            res.write(JSON.stringify({
                users: users
            }));

        }

        return res.end();

    });
}

//module.exports.addRecord = addRecord;
module.exports.getList = getList;