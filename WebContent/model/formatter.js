sap.ui.define([], function() {
    "use strict";
    return {

        approveItemEnabled: function(bApprove) {
            //this is our Controller

            var oModel = this.getView().getModel();
            var bApprovable = oModel.getProperty("approvable", this.getView().getBindingContext());

            if (bApprovable == false) {
                return false;
            }

            if (bApprovable == true && bApprove == true) {
                return true;
            }
            return false;
        },

        dummy: function() {},
        formatTimestamp: function(sTimeStamp) {

            if (sTimeStamp) return new Date(sTimeStamp).toLocaleString();

            return "";

        },

        displaysendExt: function(sStat, sPosting) {
            if (sStat === 'Approved') {
                if (!sPosting || sPosting === 'Error')
                    return true;
            }

            return false;
        },

        displayPosted: function(sPosting) {
            if (!sPosting) return "No";
            
            return sPosting;

        }
    };
});
