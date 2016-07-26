jQuery.sap.require('sap.m.MessageToast');
jQuery.sap.require('comport.model.AppModel');

sap.ui.controller("views.App", {

	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf App
	 */
	onInit : function() {

		// set new Default model
		var oModel = new comport.model.AppModel();
		this.getView().setModel(oModel);

		var oController = this;
		this.App = this.getView().byId("idApp");

		var sAuth = window.sessionStorage.getItem('Auth');

		if (sAuth) {

			oModel.requestLogin(sAuth, function(sStatus, oData) {
				if (sStatus === 200) {
					window.sessionStorage.setItem("Auth", sAuth);

					oController.navTo("pageCockpit");

				} else {
					oController.navTo('idLoginPage');

				}
			});

		}

	},

	onLogout : function(evt) {
		window.sessionStorage.removeItem('Auth');
		this.getView().setModel();
		this.navTo('idLoginPage');

	},

	onLogin : function(evt) {
		var oController = this;

		var sAuth = 'Basic '
				+ btoa(this.getView().byId("idUser").getValue() + ':'
						+ this.getView().byId("idPass").getValue());

		this.getView().byId("idUser").setValue();
		this.getView().byId("idPass").setValue();

		this.getView().setModel(new comport.model.AppModel());
		var oModel = this.getView().getModel();

		oModel.requestLogin(sAuth, function(sStatus, oData) {
			if (sStatus === 200) {
				window.sessionStorage.setItem("Auth", sAuth);

				oController.navTo("pageCockpit");

				oController.getView().byId("idUser").setValue();
				oController.getView().byId("idPass").setValue();
			} else {
				sap.m.MessageToast.show("Wrong aithorization");

			}
		});

	},

	openOrders : function() {

		var oController = this;
		var oModel = oController.getView().getModel();

		oModel.requestData("/orders", function(iCode, oData) {
			if (iCode === 200) {
				oController.navTo("Orders");
				var oViewPage = oController.App.getPage("Orders");
				oViewPage.bindElement("/orders");

			} else
				sap.m.MessageToast.show("No Data");
		});

	},

	openIncomingInvoices : function() {

		var oController = this;
		var oModel = oController.getView().getModel();

		oModel.requestData("/incinvoices", function(iCode, oData) {
			if (iCode === 200) {

				oController.navTo("Invoices");
				var oViewPage = oController.App.getPage("Invoices");
				oViewPage.bindElement("/incinvoices");

			} else
				sap.m.MessageToast.show("No Data");
		});

	},

	openIncomingOrders : function(evt) {

		var oController = this;
		var oModel = oController.getView().getModel();

		oModel.requestData("/incorders", function(iCode, oData) {
			if (iCode === 200) {
				oController.navTo("Orders");
				var oViewPage = oController.App.getPage("Orders");
				oViewPage.bindElement("/incorders");

			} else
				sap.m.MessageToast.show("No Data");
		});
	},

	openMyInvoices : function() {

		var oController = this;
		var oModel = oController.getView().getModel();

		oModel.requestData("/invoices", function(iCode, oData) {
			if (iCode === 200) {

				oController.navTo("Invoices");
				var oViewPage = oController.App.getPage("Invoices");
				oViewPage.bindElement("/invoices");
			} else
				sap.m.MessageToast.show("No Data");
		});

	},

	openSettings : function(evt) {

		this.navTo("Settings");

	},

	navBack : function() {
		this.App.back();
	},

	navHome : function() {
		this.navTo("pageCockpit");
	},

	openAP : function(evt) {

		this.getOverview();
		this.navTo('pageAP');
	},

	openAR : function(evt) {
		this.getOverview();
		this.navTo('pageAR');
	},

	navTo : function(sNavPage, oContext) {

		var sPage = sNavPage;

		// if page is embedded into view -> it has generated ID
		if (this.getView().byId(sPage)) {
			sPage = this.getView().byId(sPage).getId();
		}

		if (!this.App.getPage(sPage)) {

			var oPage = sap.ui.view({
				id : sPage,
				viewName : "views." + sPage,
				type : sap.ui.core.mvc.ViewType.XML
			});

			oPage.getController().AppController = this;
		//	oPage.setModel(this.getView().getModel());
			this.App.addPage(oPage);
		}

		this.App.to(sPage);

		if (oContext) {
			//this.App.getPage(sPage).setModel(oContext.getModel());
			this.App.getPage(sPage).setBindingContext(oContext)
		}

	},

	getOverview : function() {
		var oController = this;
		var oModel = oController.getView().getModel();

		oModel.requestData("/overview", function(iCode, oData) {

			// TODO?

		});
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