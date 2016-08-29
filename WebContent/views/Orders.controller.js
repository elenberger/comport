jQuery.sap.require("sap.ui.model.Filter");

sap.ui.controller("views.Orders", {

    /**
     * Called when a controller is instantiated and its View controls (if
     * available) are already created. Can be used to modify the View before it
     * is displayed, to bind event handlers and do other one-time
     * initialization.
     *
     * @memberOf demopartner.Orders
     */
    onInit: function() {

    },

    onOrderPress: function(evt, oData) {

        var oContext = evt.getSource().getBindingContext();

        this.AppController.navTo("OrderForm", oContext);

    },

    onNavBack: function(evt) {
        this.AppController.navBack();
    },

    onSearch: function(evt) {

			// add filters for search
			var list = this.getView().byId("overviewTable");
			var binding = list.getBinding("items");


			var aFilters = [];
			var sQuery = evt.getSource().getValue();

			if (sQuery && sQuery.length > 0) {

					var filter = new sap.ui.model.Filter("partnername",
							sap.ui.model.FilterOperator.Contains, sQuery);
					aFilters.push(filter);

					var filter = new sap.ui.model.Filter("num",
							sap.ui.model.FilterOperator.Contains, sQuery);
					aFilters.push(filter);

					var filter = new sap.ui.model.Filter("stat",
							sap.ui.model.FilterOperator.Contains, sQuery);
					aFilters.push(filter);

					var filter = new sap.ui.model.Filter("note",
							sap.ui.model.FilterOperator.Contains, sQuery);
					aFilters.push(filter);

					var oFilter = new sap.ui.model.Filter({
							filters: aFilters,
							and: false
					});

					binding.filter(oFilter, "Application");

			} else {
					binding.filter([], "Application");
			}
    },

    onDataRefresh: function(evt) {

        var oController = this;
        var oModel = oController.getView().getModel();
        var sPath = oController.getView().byId("idMasterPage").getBindingContext().getPath();
        oModel.requestData(sPath, function(iCode, oData) {
            if (iCode === 200) {
							oModel.refresh();
            } else
                sap.m.MessageToast.show("No Data");
        });
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
