jQuery.sap.require("sap.ui.model.Filter");

sap.ui.controller("views.Invoices", {

	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf demopartner.Orders
	 */
	onInit : function() {

	},

	onInvoicePress : function(evt, oData) {

		var oContext = evt.getSource().getBindingContext();

		this.AppController.navTo("InvoiceForm", oContext);

	},

	onNavBack : function(evt) {
		this.AppController.navBack();
	},

	onSearch : function(evt) {

		// add filter for search
		var aFilters = [];
		var sQuery = evt.getSource().getValue();
		if (sQuery && sQuery.length > 0) {
			var filter = new sap.ui.model.Filter("partnername",
					sap.ui.model.FilterOperator.Contains, sQuery);
			aFilters.push(filter);
		}

		// update list binding
		var list = this.getView().byId("overviewTable");
		var binding = list.getBinding("items");
		binding.filter(aFilters, "Application");
	}

/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's
 * View is re-rendered (NOT before the first rendering! onInit() is used for
 * that one!).
 * 
 * @memberOf demopartner.Orders
 */
// onBeforeRendering: function() {
//
// },
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf demopartner.Orders
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf demopartner.Orders
 */
// onExit: function() {
//
// }
});