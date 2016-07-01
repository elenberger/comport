sap.ui.controller("views.App", {

    /**
     * Called when a controller is instantiated and its View controls (if
     * available) are already created. Can be used to modify the View before it
     * is displayed, to bind event handlers and do other one-time
     * initialization.
     * 
     * @memberOf App
     */
    onInit: function () {

        var oController = this;
        this.App = this.getView().byId("idApp");

        var sAuth = window.sessionStorage.getItem('Auth');

        if (sAuth) {
            jQuery.ajax({
                type: 'GET',
                url: "/login",
                headers: {
                    'Authorization': sAuth
                },
                success: function (data, stat, xhdr) {
                    if (xhdr.status == '200') {


                        oController.getView().setModel(new sap.ui.model.json.JSONModel(data), "access");

                        oController.navTo("pageCockpit");
                    }
                },
                error: function (data, stat, xhdr) {
                    this.navTo('idLoginPage');
                }
            });

        }


    },

    onLogout: function (evt) {
        window.sessionStorage.removeItem('Auth');
        this.navTo('idLoginPage');

    },

    onLogin: function (evt) {
        var oController = this;

        var sAuth = 'Basic ' + btoa(this.getView().byId("idUser").getValue() + ':' + this.getView().byId("idPass").getValue());

        this.getView().byId("idUser").setValue();
        this.getView().byId("idPass").setValue();


        jQuery.ajax({
            type: 'GET',
            url: "/login",
            headers: {
                'Authorization': sAuth
            },
            success: function (data, stat, xhdr) {
                if (xhdr.status == '200') {

                    // variant 1
                    $.sap.require("jquery.sap.storage");
                    var UI5Storage = $.sap
                        .storage(jQuery.sap.storage.Type.session);
                    UI5Storage.remove("Auth");
                    UI5Storage.put("Auth", sAuth);

                    // Variant2
                    window.sessionStorage.setItem("Auth", sAuth);

                    oController.getView().setModel(new sap.ui.model.json.JSONModel(data), "access");

                    oController.navTo("pageCockpit");

                    oController.getView().byId("idUser").setValue();
                    oController.getView().byId("idPass").setValue();

                }
            },
            error: function (data, stat, xhdr) {
                alert("Access denied!");
            }
        });

    },

    openOrders: function () {

        // Authorization': sAuth

        // Call REST async
        var sAuth = window.sessionStorage.getItem('Auth');
        var oController = this;

        jQuery.ajax({
            type: 'GET',
            url: "/orders",
            headers: {
                'Authorization': sAuth
            },
            success: function (data, stat, xhdr) {
                if (xhdr.status == '200') {

                    oController.navTo("Orders");

                    var oOrders = oController.App.getPage("Orders");

                    oOrders.setModel(new sap.ui.model.json.JSONModel(data));


                }
            },
            error: function (data, stat, xhdr) {
                alert("Access denied!");
            }
        });

    },

    openIncomingInvoices: function () {

        // Authorization': sAuth

        // Call REST async
        var sAuth = window.sessionStorage.getItem('Auth');
        var oController = this;

        oController.navTo("Invoices");

        //		jQuery.ajax({
        //			type : 'GET',
        //			url : "/orders",
        //			headers : {
        //				'Authorization' : sAuth
        //			},
        //			success : function(data, stat, xhdr) {
        //				if (xhdr.status == '200') {
        //
        //					oController.navTo("Orders");
        //
        //					var oOrders = oController.App.getPage("Orders");
        //
        //					oOrders.setModel(new sap.ui.model.json.JSONModel(data));
        //
        //
        //				}
        //			},
        //			error : function(data, stat, xhdr) {
        //				alert("Access denied!");
        //			}
        //		});

    },

    openIncomingOrders: function (evt) {


        // Call REST async
        var sAuth = window.sessionStorage.getItem('Auth');
        var oController = this;

        jQuery.ajax({
            type: 'GET',
            url: "/incorders",
            headers: {
                'Authorization': sAuth
            },
            success: function (data, stat, xhdr) {
                if (xhdr.status == '200') {

                    oController.navTo("Orders");

                    var oOrders = oController.App.getPage("Orders");

                    oOrders.setModel(new sap.ui.model.json.JSONModel(data));


                }
            },
            error: function (data, stat, xhdr) {
                alert("Access denied!");
            }
        });

    },

    openMyInvoices: function () {

        // Authorization': sAuth

        // Call REST async
        var sAuth = window.sessionStorage.getItem('Auth');
        var oController = this;
        
        
        // Call REST async
        var sAuth = window.sessionStorage.getItem('Auth');
        var oController = this;

        jQuery.ajax({
            type: 'GET',
            url: "/invoices",
            headers: {
                'Authorization': sAuth
            },
            success: function (data, stat, xhdr) {
                if (xhdr.status == '200') {

                	 oController.navTo("Invoices");

                    var oInvoices = oController.App.getPage("Invoices");

                    oInvoices.setModel(new sap.ui.model.json.JSONModel(data));


                }
            },
            error: function (data, stat, xhdr) {
                alert("Error while requesting invoice list");
            }
        });
        

       

    },

    openSettings: function (evt) {

        this.navTo("Settings");

    },

    navBack: function () {
        this.App.back();
    },

    navHome: function () {
        this.navTo("Tiles");
    },

    openAP: function (evt) {
        this.navTo('pageAP');
    },

    openAR: function (evt) {
        this.navTo('pageAR');
    },

    navTo: function (sNavPage, oContext) {

        var sPage = sNavPage;

        // if page is embedded into view -> it has generated ID
        if (this.getView().byId(sPage)) {
            sPage = this.getView().byId(sPage).getId();
        }

        if (!this.App.getPage(sPage)) {

            var oPage = sap.ui.view({
                id: sPage,
                viewName: "views." + sPage,
                type: sap.ui.core.mvc.ViewType.XML
            });

            oPage.getController().AppController = this;
            this.App.addPage(oPage);
        }

        this.App.to(sPage);

        if (oContext) {
            this.App.getPage(sPage).setModel(oContext.getModel());
            this.App.getPage(sPage).setBindingContext(oContext)
                // this.App.getPage(sPage).bindElement(oContext.getPath());
        }

    }

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's
     * View is re-rendered (NOT before the first rendering! onInit() is used for
     * that one!).
     * 
     * @memberOf App
     */
    // onBeforeRendering: function() {
    //
    // },
    /**
     * Called when the View has been rendered (so its HTML is part of the document).
     * Post-rendering manipulations of the HTML could be done here. This hook is the
     * same one that SAPUI5 controls get after being rendered.
     * 
     * @memberOf App
     */
    // onAfterRendering: function() {
    //
    // },
    /**
     * Called when the Controller is destroyed. Use this one to free resources and
     * finalize activities.
     * 
     * @memberOf App
     */
    // onExit: function() {
    //
    // }
});