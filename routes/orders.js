var ordersModel = require('./dbwrapper').ordersModel;
var rest = require('./restcallwrapper');


var mongoose = require('mongoose');
var ValidationError = mongoose.Error.ValidationError;
var ValidatorError  = mongoose.Error.ValidatorError;



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
    
//    var Order = new ordersModel(req.body);
//    Order.save();
    
ordersModel.schema.pre('save', function(next) {
   if (this.num.length > 10) {
       var error = new ValidationError(this);
       error.errors.num = new ValidatorError('num', 'length for number is invalid', 'notvalid', this.num);
    return next(error);
   }
    
    this.stat = 'Approval';
    
    next();
    
});
    
    ordersModel.create(req.body, function (err, order) {
        
        
        if (err) 
        { console.log(err);
            return res.send(err) }
        
        return res.send(order);

    });

};



getList = function (req, res) {

    res.setHeader("Content-Type", "application/json");

    ordersModel.find().lean().exec(function (err, orders) {
        if (!err) {
            
            //add some fields in order
            
            for (i=0; i<orders.length; i++) {
                var doc = orders[i];
            
                //add partner description
                for (j=0; j<doc.partners.length; j++) {
                    doc.partners[j].partnername = "We deliver everything";
                }
                
                //add static approval procedure
                var aApprovals = [{stepno:1, steptype:"approval", partnername: "We deliver everything"},
                                  {stepno:2, steptype:"notification", partnername: "Good big company"}   ];
                
                orders[i].approval = aApprovals;
            }
            
            res.write(JSON.stringify({
                orders: orders
            }));
            //dd
        }

        return res.end();

    });

};

getOrderDetails = function(req, res) {

    //Object to retrieve and push Order details
    
    var sId = req.params.id;
    
    rest.performGetRequest("/sap/bc/rest/z_comport/po/"+sId, "", function(bkndres){
        
        
                 res.write(JSON.stringify({
                orderDetails: bkndres
            }));
        

        return res.end();
                    
    });
    
//    
//    //req.params.id
//    res.setHeader("Content-Type", "application/json");
//    
//    var orderDetails = {
//        num: "4508937483", //string(10)
//        date: "2016-05-25", // date a string YYYY-MM-DD
//        note: "Our order", //String
//        netamout: 5000, //currency
//        vatamout: 1000, 
//        positions: [{posid: 0, 
//                     postxt: "", 
//                     deliverydate: "",
//                     quntity: 0, 
//                     price: 0, 
//                     netamout: 0, 
//                     vatamout: 0}],
//        parties:   [{posid: 0, 
//                     partnerid: "", 
//                     role: "" //for PO will be Vendoe, for SO will be customer
//                    } ]
//    };
//    
//    var Details1 = orderDetails;
//
//         res.write(JSON.stringify({
//                orderDetails: Details1
//            }));
//        
//
//        return res.end();
                    
    
};


module.exports.addRecord = addRecord;
module.exports.getList = getList;
module.exports.getOrderDetails = getOrderDetails;