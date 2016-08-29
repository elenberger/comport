var basicAuth = require('basic-auth');
var emailer = require('./emailer');
var getUser = require('./users').getUser;
var mUser = require('./users');

// process approval array
getDocApprovals = function(aInputApprovals) {

    return new Promise(
        function(resolve, reject) {

            var aApprovals = aInputApprovals;

            //         determine active approval step
            var bActiveStepFound = false;
            for (var a = 0; a < aApprovals.length; a++) {
                aApprovals[a].approve = false;
                if (!aApprovals[a].resdate) {
                    if (!bActiveStepFound) {
                        bActiveStepFound = true;
                        aApprovals[a].approve = true;
                    }
                }
            }

            //         fill additional fields
            var aStepProm = [];
            for (var a = 0; a < aApprovals.length; a++) {

                var oStepProm = new Promise(
                    function(resolve, reject) {
                        var oApprovalStep = aApprovals[a];
                        getPartnerById(oApprovalStep.partnerid)
                            .then(
                                function(oPartner) {
                                    oApprovalStep.partnername = oPartner.partnername;
                                    resolve(oApprovalStep);
                                });
                    });

                aStepProm.push(oStepProm);
            }

            Promise.all(aStepProm).then(function(oApprovalSteps) {
                resolve(aApprovals);
            });
        });
};

approveOrder = function(req, res, oOrder) {

    // adapt object from request

    var oMessage = {
        operation: req.body.operation,
        note: req.body.order.note
    }

    approveDoc(req, oMessage, oOrder).then(
        // resolve
        function(oMsg) {
            res.status(200).send(oMsg);
            setTimeout(function() {
                _sendEmail(req, oOrder);
            }, 10000);

        },
        // reject
        function(oErr) {
            return res.status(200).send(oErr);
        });
};

approveInvoice = function(req, res, oInvoice) {
    // adapt object from request

    var oMessage = {
        operation: req.body.operation,
        note: req.body.invoice.note
    }

    approveDoc(req, oMessage, oInvoice).then(
        // resolve
        function(oMsg) {
            res.status(200).send(oMsg);
            setTimeout(function() {
                _sendEmail(req, oInvoice);
            }, 10000);
        },
        // reject
        function(oErr) {
            return res.status(200).send(oErr);
        });
};

approveDoc = function(req, oMessage, oDoc) {

    return new Promise(function(resolve, reject) {
        var sUserid = basicAuth(req).name;

        if (oDoc.stat !== 'Approval')
            return reject({
                "error": "document is not in approval step"
            });

        var oResStep = oDoc.approval.find(function(oApprovalStep) {

            if (!oApprovalStep.resdate && oApprovalStep.steptype === 'A') return oApprovalStep;

        });

        if (!oResStep)
            return reject({
                "error": "document is not in approval step"
            });

        mUser.validatePartner(req, oResStep.partnerid).then(
            function(bAllowed) {

         
                if (!bAllowed) return reject({
                    "error": "You are not allowed to approve document"
                });

                //Resolve workflow item
                oResStep.resdate = Date.now();
                oResStep.resolver = sUserid;

                if (oMessage.note)
                    oResStep.note = oMessage.note;


                // execute follow actions, complete WF

                var bCompleted = true;
                for (var a = 0; a < oDoc.approval.length; a++) {

                    // If one More Approval step
                    if (!oDoc.approval[a].resdate &&
                        oDoc.approval[a].steptype === 'A') {
                        bCompleted = false;
                        break;
                    }

                    //Notification step
                    if (!oDoc.approval[a].resdate &&
                        oDoc.approval[a].steptype === 'N') {
                        // Notification\email should be send here
                        oDoc.approval[a].resdate = Date.now();
                        oDoc.approval[a].resolver = sUserid;
                    }
                }

                // Update document status

                if (bCompleted && oMessage.operation === 'A')
                    oDoc.stat = "Approved";
                else if (oMessage.operation === 'R')
                    oDoc.stat = "Rejected";

                //save, send email and exit
                
                oDoc.save(function(err) {
                    if (err)
                        return reject({
                            "error": "Operation cancelled"
                        });

                    //resolve will finish response and we will send mail afterwards
                    resolve({
                        "message": "Operation completed successfully"
                    });

                });
            });
    });

};

_sendEmail = function(req, oDoc) {

    //email to Owner with new document status, send async
    var oMailParams = {
        num: oDoc.num,
        partnerid: oDoc.partnerid,
        sendto: oDoc.partnerid,
        stat: oDoc.stat,
        doctype: 'Document'
    }

    if (oDoc.constructor.modelName === 'orders')
        oMailParams.doctype = 'Order';
    else if (oDoc.constructor.modelName === 'invoices')
        oMailParams.doctype = 'Invoice';

    emailer.sendDocInfoMsg(req, oMailParams);


};

module.exports.getDocApprovals = getDocApprovals;
module.exports.approveOrder = approveOrder;
module.exports.approveInvoice = approveInvoice;
