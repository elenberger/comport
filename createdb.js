//create required initial data to be able to use comport

var db = require('./routes/dbwrapper');

var aPromises = [];

//Generate superadmin
aPromises.push(new Promise(function(resolve, reject) {
    db.usersModel.findOneAndUpdate({
            userid: 'Admin'
        }, {
            "userid": "Admin",
            "pass": "111",
            "name": "Administrator",
            "email": "admin@mycorp.eu",
            "address": "Berlin, Westerplatte 1",
            "comment": "Super user ",
            "partners": [],
            "sadm": true,
            "roles": [
                "ADMINISTRATOR"
            ]
        }, {
            new: true,
            upsert: true
        },
        function(err, oNewUser) {
            if (err) console.log("Error during user creation ");
            resolve();
        }
    );
}));

//generate WF template for order
aPromises.push(new Promise(function(resolve, reject) {
    db.workflowsModel.findOneAndUpdate({
            wfid: 'dummy'
        }, {
            "wfid": "dummy",
            "partnerid": "",
            "steps": [{
                "stepno": 1,
                "steptype": "A",
                "role": "Vendor"
            }]
        }, {
            new: true,
            upsert: true
        },
        function(err, oNewUser) {
            if (err) console.log("Error during WF template for order creation ");
            resolve();
        }
    );
}));

//generate WF template for Invoice
aPromises.push(new Promise(function(resolve, reject) {
    db.workflowsModel.findOneAndUpdate({
            wfid: 'dummyinv'
        }, {
            "wfid": "dummyinv",
            "partnerid": "",
            "steps": [{
                "stepno": 1,
                "steptype": "A",
                "role": "Billto"
            }]
        }, {
            new: true,
            upsert: true
        },
        function(err, oNewUser) {
            if (err) console.log("Error during WF template for order creation ");
            resolve();
        }
    );
}));

//return when done
Promise.all(aPromises).then(function() {
    process.exit();
});
