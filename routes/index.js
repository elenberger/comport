var express = require('express');
var router = express.Router();
var path = require('path');
var auth = require('./auth');
var emailer = require('./emailer');
var orders = require('./orders');
var invoices = require('./invoices');
var users = require('./users');
var partners = require('./partners');
var overview = require('./overview').overview;

router.use(function(req, res, next) {
	auth(req, res, next);
});

/* GET home */
router.get('/login', function(req, res, next) {

	users.getUser(req).then(

	function(oUser) {
		// fill access\roles parameters
		res.setHeader("Content-Type", "application/json");

		var oAccess = {
			"ADMINISTRATOR" : false,
			"AP-ORD" : false,
			"AP-INV" : false,
			"AR-ORD" : false,
			"AR-INV" : false
		};
		var aRoles = oUser.roles;
		if (aRoles) {
			for (i = 0; i < aRoles.length; i++) {
				oAccess[aRoles[i]] = true;
			}
		}
		res.write(JSON.stringify(oAccess));
		res.end();
	}, function(err) {
		res.end(err);
	});

});

router.get('/partners', partners.getList);
router.post('/partners', partners.maintainPartner);

router.get('/users', users.getUserList);
router.post('/users', users.maintainUser);
router.post('/assignpartner', users.assignPartner);

router.get('/orders', orders.getOwnOrders);
router.get('/orders/:partnerid/:num/', orders.getOrderDetails);
router.post('/orders', orders.maintainOrder);
router.get('/incorders', orders.getIncOrders);

router.get('/invoices', invoices.getOwnInvoices);
router.get('/invoices/:partnerid/:num/', invoices.getInvoiceDetails);

router.get('/incinvoices', invoices.getIncInvoices);

router.post('/invoices', invoices.maintainInvoice);

router.get('/overview', overview);

module.exports = router;
