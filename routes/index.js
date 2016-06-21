var express = require('express');
var router = express.Router();
var path = require('path');
var auth = require('./auth');
var orders = require('./orders');
var users = require('./users');
var partners = require('./partners');



router.use(function(req, res, next) {
	auth(req, res, next );	
});

/* GET home */
router.get('/login', function(req, res, next) {
    
	users.getUser(req, res).then(
			
			function(oUser){
				//fill access\roles parameters
				res.setHeader("Content-Type", "application/json");
	            
				var oAccess = {"ADMINISTRATOR": false, "AP-ORD": false, "AP-INV":false, "AR-ORD": false, "AR-INV":false};
				var aRoles = oUser.roles;
				if (aRoles) {
				for (i=0;i<aRoles.length; i++) {
					oAccess[aRoles[i]] = true;
				}
				}
				res.write(JSON.stringify({
	                access: oAccess
	            }));
				res.end();
			}, 			
			function(err){
		res.end(err);	
	});
	
	
    
});


router.get('/partners', partners.getList);

router.get('/users', users.getList); 
router.post('/assignpartner', users.assignPartner); 


router.get('/orders', orders.getOwnOrders);
router.get('/orders/:id/', orders.getOrderDetails);
router.post('/orders', orders.maintainOrder);
router.get('/incorders', orders.getIncOrders);




// router.get('/orders', function(req, res, next) {
  
//   console.log("orders");
  
// 	orders().addRecord();
		
//   res.setHeader("Content-Type", "application/json");

//   var aObj  = [{
// 			"id": "100",
// 			"descr": "order1",
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
	
// res.write(JSON.stringify({orders: aObj}));
	
// res.end();


// 		});
    
       

module.exports = router;
