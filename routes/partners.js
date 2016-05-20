var partnersModel = require('./dbwrapper').partnersModel;

getList = function (req, res) {

    res.setHeader("Content-Type", "application/json");

    partnersModel.find({}, function (err, partners) {
        if (!err) {

            res.write(JSON.stringify({
                partners: partners
            }));

        }

        return res.end();

    });
}

//module.exports.addRecord = addRecord;
module.exports.getList = getList;