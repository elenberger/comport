var oExtFormatter;
sap.ui.define([ "comport/model/formatter" ], function(oObject) {
	"use strict";
	oExtFormatter = oObject;
});

sap.ui.controller("views.OrderForm", {

	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf demopartner.OrderForm
	 */

	oFormatter : oExtFormatter,

	onInit : function() {

	},

	onNavBack : function() {

		this.AppController.navBack();
	},

	onNavHome : function() {

		this.AppController.navHome();
	},

	onTabSelect : function(evt) {

		if (evt.getParameters().key == "details") {
			var oView = this.getView();
			var oContext = oView.getBindingContext();
			var sNum = oContext.getModel().getProperty(oContext.getPath()).num;
			var sPartnerid = oContext.getModel()
					.getProperty(oContext.getPath()).partnerid;

			var oTab = evt.getParameters().selectedItem;
			var oModel = this.getView().getModel();
			oController = this;

			sEndPoint = "/orders/" + sPartnerid + "/" + sNum;
			oModel.requestData(sEndPoint,
					function(iCode, oData) {
						if (iCode === 200) {
							oContext = oController.getView()
									.getBindingContext();
							oModel.setProperty(
									"orderdetails",
									oData.orderDetails,
									oContext);

						} // else sap.m.MessageToast.show("No
						// Data");
					});
		}
	},

	formatApprovalIcon : function(bApprove, sStepType) {
		if (sStepType === 'N') {
			return "sap-icon://message-information";
		} else
			return bApprove === true ? "sap-icon://process"
					: "sap-icon://expand-group";

	},

	refreshOrders : function(evt) {

		var sPath = this.AppController.App.getPage("Orders")
				.getBindingContext().getPath();
		this.getView().getModel().requestData(sPath, function(iCode, oData) {
		});
	},

	sendApprove : function(oContext, sAction) {

		var sAuth = window.sessionStorage.getItem('Auth');
		var oModel = oContext.getModel();

		var oController = this;
		
		var oOrder = {
			num : oModel.getProperty("num", oContext),
			partnerid : oModel.getProperty("partnerid", oContext),
			note : this.getView().byId("approvalComment").getValue()
		};
		var oObj = {
			operation : sAction,
			order : oOrder
		};
        
		
		oModel
		.postData(
				"/orders",
				oObj,
				function(iStatus, oData) {

					if (iStatus === 200) {
						if (oObj.operation === 'A')
							sap.m.MessageToast
									.show("Document was successfully approved ");
						else
							sap.m.MessageToast
									.show("Document was successfully rejected ");
						oController.refreshOrders();
					} else
						sap.m.MessageToast
								.show("Error while processing document");

				});

	},

	approveOrder : function(evt) {
		this.sendApprove(this.getView().getBindingContext(), 'A');

	},

	rejectOrder : function(evt) {
		this.sendApprove(this.getView().getBindingContext(), 'A');
	}

/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's
 * View is re-rendered (NOT before the first rendering! onInit() is used for
 * that one!).
 * 
 * @memberOf demopartner.OrderForm
 */
// onBeforeRendering: function() {
//
// },
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf demopartner.OrderForm
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf demopartner.OrderForm
 */
// onExit: function() {
//
// }
});
