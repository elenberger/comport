//GeXcoR9!

//n.reply@list.ru
//noreply.1@mail.ru
//euro.trans.04@list.ru
//continental.12@list.ru

var nodemailer = require('nodemailer');
var partners = require('./partners');
var settings = require('../settings').emailer;

sendDocApproveMsg = function(req, oParams) {

    var pOwner = partners.getPartnerById(oParams.partnerid);
    pOwner.then(function(oPartner) {
        var pSendTo = partners.getPartnerById(oParams.sendto);
        pSendTo.then(function(oSendTo) {

            var oMailOpt = {};

            // get partner email

            oMailOpt.to = oSendTo.email;
            oMailOpt.subject = 'Please approve ' + oParams.doctype.toLowerCase() + ' #' + oParams.num;
            oMailOpt.template = 'mail';
            oMailOpt.bodyparams = {};
            oMailOpt.bodyparams.textp1 = 'New ' + oParams.doctype.toLowerCase() + oParams.num + ' from ' +
                oPartner.partnername +
                ' has been received. Please approve.';

            sendEmail(req, oMailOpt);

        });
    });

};

sendDocInfoMsg = function(req, oParams) {

    var pSendTo = partners.getPartnerById(oParams.sendto);
    pSendTo.then(function(oSendTo) {

        var oMailOpt = {};

        // get partner email
        oMailOpt.to = oSendTo.email;
        oMailOpt.subject = oParams.doctype + ' #' + oParams.num + ' has been changed';
        oMailOpt.template = 'mail';
        oMailOpt.bodyparams = {};
        oMailOpt.bodyparams.textp1 = oParams.doctype + ' #' + oParams.num +
            ' has been changed.  New status is ' + oParams.stat + '.';

        sendEmail(req, oMailOpt);


    });
};

sendEmail = function(req, oMailOpt) {
    // oMailOpt = {to, subject, template, bodyparams:{texth1, texth2, texth3,
    // textp1}}

    var smtpTransport = nodemailer.createTransport(settings.service, {
        auth: {
            user: settings.from, // Your email id
            pass: settings.pass // Your password
        }
    });

    var app = req.app;
    app.render(oMailOpt.template, oMailOpt.bodyparams, function(err, html) {

        var mailOptions = {
            from: settings.from, // sender address
            to: oMailOpt.to, // list of receivers
            subject: oMailOpt.subject, // Subject line
            // text: text
            html: html
        };

        smtpTransport.sendMail(mailOptions, function(error, info) {
            if (error) {
                try {
                    console.log(error);
                } catch (err) {}
            };
        });

    });

};
module.exports.sendDocApproveMsg = sendDocApproveMsg;
module.exports.sendDocInfoMsg = sendDocInfoMsg;
