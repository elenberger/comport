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
		
		//data model with temporary data
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.loadData("views/db1.json", "", false);

		sap.ui.getCore().setModel(oModel);
		
		
		this.App = this.getView().byId("idApp");

		// Add pages
		var oTiles = sap.ui.view({
			id : "idTiles",
			viewName : "views.Tiles",
			type : sap.ui.core.mvc.ViewType.XML
		});
		oTiles.getController().AppController = this;
		this.App.addPage(oTiles);

		var oLogin = sap.ui.view({
			id : "idLogin",
			viewName : "views.Login",
			type : sap.ui.core.mvc.ViewType.XML
		});
		oLogin.getController().App = this.App;
		this.App.addPage(oLogin);
		this.App.setInitialPage(oLogin);

	},

	openOrders : function() {
		if (!this.App.getPage("idOrders")) {
			var oOrders = sap.ui.view({
				id : "idOrders",
				viewName : "views.Orders",
				type : sap.ui.core.mvc.ViewType.XML
			});
			oOrders.getController().AppController = this;
			this.App.addPage(oOrders);
		}

		this.App.to("idOrders");

	},

	openSettings: function(evt) {

		if (!this.App.getPage("idSettings")) {
			var oSettings = sap.ui.view({
				id : "idSettings",
				viewName : "views.Settings",
				type : sap.ui.core.mvc.ViewType.XML
			});
			oSettings.getController().AppController = this;
			this.App.addPage(oSettings);
		}

		this.App.to("idSettings");
		
	},
	
	navBack : function() {
		this.App.back();
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