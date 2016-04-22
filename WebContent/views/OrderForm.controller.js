sap.ui.controller("views.OrderForm", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf demopartner.OrderForm
*/
//	onInit: function() {
//
//	},
	
	onNavBack: function() {
		
		var sMaster = this.ParentController.getView().byId("idOrders").getInitialMaster();
	  this.ParentController.getView().byId("idOrders").toMaster(sMaster);
	},

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