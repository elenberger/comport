//GeXcoR9!

//n.reply@list.ru
//noreply.1@mail.ru
//euro.trans.04@list.ru
//continental.12@list.ru

var nodemailer = require('nodemailer');
var partners = require('./partners');

sendOrderApproveMsg = function(req, oParams) {

	var pOwner = partners.getPartnerById(oParams.partnerid);
	pOwner.then(function(oPartner) {
		var pSendTo = partners.getPartnerById(oParams.sendto);
		pSendTo.then(function(oSendTo) {

			var oMailOpt = {};

			// get partner email

			oMailOpt.to = oSendTo.email;
			oMailOpt.subject = 'Please approve order ' + oParams.num;
			oMailOpt.template = 'mail';
			oMailOpt.bodyparams = {};
			oMailOpt.bodyparams.textp1 = 'New order ' + oParams.num + ' from '
					+ oPartner.partnername
					+ ' has been received. Please approve';

			sendEmail(req, oMailOpt);

		});
	});

};

sendOrderInfoMsg = function(req, oParams) {
	var pSendTo = partners.getPartnerById(oParams.sendto);
	pSendTo.then(function(oSendTo) {

		var oMailOpt = {};

		// get partner email
		oMailOpt.to = oSendTo.email;
		oMailOpt.subject = ' Order  ' + oParams.num + ' has been changed';
		oMailOpt.template = 'mail';
		oMailOpt.bodyparams = {};
		oMailOpt.bodyparams.textp1 = 'Order  ' + oParams.num
				+ ' has been changed.  New status is ' + oParams.stat + '.';

		sendEmail(req, oMailOpt);

	});
};

sendEmail = function(req, oMailOpt) {
	// oMailOpt = {to, subject, template, bodyparams:{texth1, texth2, texth3,
	// textp1}}

	var smtpTransport = nodemailer.createTransport("Mail.Ru", {
		auth : {
			user : 'noreply.1@mail.ru', // Your email id
			pass : 'GeXcoR9!' // Your password
		}
	});

	var app = req.app;
	app.render(oMailOpt.template, oMailOpt.bodyparams, function(err, html) {

		var mailOptions = {
			from : 'noreply.1@mail.ru', // sender address
			to : oMailOpt.to, // list of receivers
			subject : oMailOpt.subject, // Subject line
			// text: text
			html : html
		};

		smtpTransport.sendMail(mailOptions, function(error, info) {
			if (error) {
				// TODO write message to LOG
			}
			;
		});

	});

};
module.exports.sendOrderApproveMsg = sendOrderApproveMsg;
module.exports.sendOrderInfoMsg = sendOrderInfoMsg;
