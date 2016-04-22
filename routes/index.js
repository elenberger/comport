var express = require('express');
var router = express.Router();
var path = require('path');
var auth = require('./auth');
var orders = require('./orders');



router.use(function(req, res, next) {
	auth(req, res, next );	
});

/* GET home */
router.get('/login', function(req, res, next) {
  
	res.end();
  	 			 
			 //		res.sendFile(path.join(__dirname, '../WebContent','index.html'));
	
	
  // res.render('index', { title: 'Express' });
 // var i = 1;
});


router.get('/orders', orders.getList); 
router.post('/orders', orders.addRecord); 
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
