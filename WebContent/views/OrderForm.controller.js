sap.ui.controller("views.OrderForm", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf demopartner.OrderForm
     */
    //	onInit: function() {
    //
    //	},

    onNavBack: function () {

        this.AppController.navBack();
    },
    
    onNavHome: function () {

        this.AppController.navHome();
    },

    onTabSelect: function (evt) {

        if (evt.getParameters().key == "details") {
            var oView = this.getView();
        //    var oContext = oView.byId("Form1").getBindingContext();
            var oContext = oView.getBindingContext();
            var sNum = oContext.getModel().getProperty(oContext.getPath()).num;

            var oTab = evt.getParameters().selectedItem;

            var sAuth = window.sessionStorage.getItem('Auth');

            var oBusyDialog = oView.byId("idBusyDialog");
                oBusyDialog.open(); 

            jQuery.ajax({
                type: 'GET',
                url: "/orders/" + sNum,
                headers: {
                    'Authorization': sAuth
                },
                success: function (data, stat, xhdr) {
                    if (xhdr.status == '200') {

                        oTab.setModel(new sap.ui.model.json.JSONModel(data));
                        oTab.bindElement("/orderDetails");
                        //oView.setBusy(false);
                        oBusyDialog.close();
                    }
                },
                error: function (data, stat, xhdr) {
                    alert("Access denied!");
                    //oView.setBusy(false);
                    oBusyDialog.close();
                }
            });
        }
    },
    
    formatApprovalIcon: function(bApprove) {
    	return bApprove === true ? "sap-icon://process" : "sap-icon://expand-group";

    }

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf demopartner.OrderForm
     */
    //	onBeforeRendering: function() {
    //
    //	},

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf demopartner.OrderForm
     */
    //	onAfterRendering: function() {
    //
    //	},

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf demopartner.OrderForm
     */
    //	onExit: function() {
    //
    //	}

});
