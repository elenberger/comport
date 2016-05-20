var ordersModel = require('./dbwrapper').ordersModel;


//var orders = function() {

//  var oObj = {};

testImport = function () {

    // Временное добавление данных
    var order1 = new ordersModel({
        id: "1002"
        , descr: "1233"
        , dstart: "01.01.2016"
        , dfinish: "31.03.2016"
        , pos: [
            {
                "id": "1"
                , "text": "service1"
                , "amount": 1334.34
            }
            
            , {
                "id": "2"
                , "text": "service2"
                , "amount": 150.01
            }]
        , parties: [
            {
                "role": "vendor"
                , "id": "1234567894"
                , "text": " Aldomayer AG"
            }
            
            , {
                "role": "billto"
                , "id": "1234567895"
                , "text": " Schweriner moebel GmbH"
            }
			]

    });

    //   console.log("save");
    order1.save(function (err) {});

};

addRecord = function (req, res) {
    ordersModel.create(req.body, function (err, order) {

        if (err) return console.log(err);
        return res.send(order);

    });

};



getList = function (req, res) {

    res.setHeader("Content-Type", "application/json");

    ordersModel.find({}, function (err, orders) {
        if (!err) {

            res.write(JSON.stringify({
                orders: orders
            }));
            //dd
        }

        return res.end();

    });
    //   var aObj  = [{
    // 			"id": "10044",
    // 			"descr": "order1344455",
    // 			"dstart": "01.01.2016",
    // 			"dfinish": "31.03.2016",
    // 			"pos": [
    // 			  {"id": "1","text": "service1", "amount": 1334.34},
    // 			  {"id": "2","text": "service2", "amount": 150.01},
    // 			  {"id": "3","text": "service3", "amount": 12.00}],

    // 			"parties": [
    // 			{"role": "vendor", "id": "1234567894", "text": " Aldomayer AG"},
    // 			{"role": "billto", "id": "1234567895", "text": " Schweriner moebel GmbH"}
    // 			]
    // 		}];




};

//return oObj;


module.exports.addRecord = addRecord;
module.exports.getList = getList;