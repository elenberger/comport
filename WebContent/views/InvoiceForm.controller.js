var oExtFormatter;

jQuery.sap.require('comport.model.AppModel');

sap.ui.define([ "comport/model/formatter" ], function(oObject) {
	"use strict";
	oExtFormatter = oObject;
});

sap.ui
		.controller(
				"views.InvoiceForm",
				{

					oFormatter : oExtFormatter,

					onNavBack : function() {

						this.AppController.navBack();
					},

					onNavHome : function() {

						this.AppController.navHome();
					},

					refreshInvoices : function(evt) {
						var sPath = this.AppController.App.getPage("Invoices").getBindingContext().getPath();
						this.getView().getModel().requestData(sPath,
								function(iCode, oData) {
								});
					},

					onTabSelect : function(evt) {

						if (evt.getParameters().key == "details") {
							var oView = this.getView();
							var oContext = oView.getBindingContext();
							var sNum = oContext.getModel().getProperty(
									oContext.getPath()).num;
							sPartnerid = oContext.getModel().getProperty(
									oContext.getPath()).partnerid;

							var oModel = this.getView().getModel();

							var oTab = evt.getParameters().selectedItem;
							oTab.setModel(oModel);

							var oController = this;

							var sEndPoint = "/invoices/" + sPartnerid + "/"
									+ sNum;

							oModel.requestData(sEndPoint,
									function(iCode, oData) {
										if (iCode === 200) {
											oContext = oController.getView()
													.getBindingContext();
											oModel.setProperty(
													"invoicedetails",
													oData.invoiceDetails,
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

					sendApprove : function(oContext, sAction) {

						var oModel = oContext.getModel();
						var oController = this;

						var oInvoice = {
							num : oModel.getProperty("num", oContext),
							partnerid : oModel.getProperty("partnerid",
									oContext),
							order : oModel.getProperty("order/num", oContext),
							note : this.getView().byId("approvalComment")
									.getValue()
						};
						var oObj = {
							operation : sAction,
							invoice : oInvoice
						};

						oModel
								.postData(
										"/invoices",
										oObj,
										function(iStatus, oData) {

											if (iStatus === 200) {
												if (oObj.operation === 'A')
													sap.m.MessageToast
															.show("Document was successfully approved ");
												else
													sap.m.MessageToast
															.show("Document was successfully rejected ");
												oController.refreshInvoices();
											} else
												sap.m.MessageToast
														.show("Error while processing document");

										});

					},

					approveInvoice : function(evt) {
						this.sendApprove(this.getView().getBindingContext(),
								'A');

					},

					rejectInvoice : function(evt) {
						this.sendApprove(this.getView().getBindingContext(),
								'R');
					},

					sendExtSys : function(evt) {
						var oController = this;
						var oContext = this.getView().getBindingContext();
						var oModel = oContext.getModel();

						var oInvoice = {
							num : oModel.getProperty("num", oContext),
							partnerid : oModel.getProperty("partnerid",
									oContext),
							order : oModel.getProperty("order/num", oContext)
						};
						var oObj = {
							operation : 'X',
							invoice : oInvoice
						};

						oModel
								.postData(
										"/invoices",
										oObj,
										function(iStatus, oData) {

											if (iStatus === 200) {
												sap.m.MessageToast
														.show("Invoice has been successfully sent to External System");
												oController.refreshInvoices();	
											}
											
											else
												sap.m.MessageToast
														.show("Error while sending message to external system");

										});

					}

				/**
				 * Similar to onAfterRendering, but this hook is invoked before
				 * the controller's View is re-rendered (NOT before the first
				 * rendering! onInit() is used for that one!).
				 * 
				 * @memberOf demopartner.OrderForm
				 */
				// onBeforeRendering: function() {
				//
				// },
				/**
				 * Called when the View has been rendered (so its HTML is part
				 * of the document). Post-rendering manipulations of the HTML
				 * could be done here. This hook is the same one that SAPUI5
				 * controls get after being rendered.
				 * 
				 * @memberOf demopartner.OrderForm
				 */
				// onAfterRendering: function() {
				//
				// },
				/**
				 * Called when the Controller is destroyed. Use this one to free
				 * resources and finalize activities.
				 * 
				 * @memberOf demopartner.OrderForm
				 */
				// onExit: function() {
				//
				// }
				});
