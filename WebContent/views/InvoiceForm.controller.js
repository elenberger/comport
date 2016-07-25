var oExtFormatter;
sap.ui.define([ "comport/model/formatter" ], function(oObject) {
	"use strict";
	oExtFormatter = oObject;
});

sap.ui
		.controller(
				"views.InvoiceForm",
				{

					/**
					 * Called when a controller is instantiated and its View
					 * controls (if available) are already created. Can be used
					 * to modify the View before it is displayed, to bind event
					 * handlers and do other one-time initialization.
					 * 
					 * @memberOf demopartner.OrderForm
					 */

					oFormatter : oExtFormatter,

					// onInit: function() {
					//
					// },

					onNavBack : function() {

						this.AppController.navBack();
					},

					onNavHome : function() {

						this.AppController.navHome();
					},

					onTabSelect : function(evt) {

						if (evt.getParameters().key == "details") {
							var oView = this.getView();
							// var oContext =
							// oView.byId("Form1").getBindingContext();
							var oContext = oView.getBindingContext();
							var sNum = oContext.getModel().getProperty(
									oContext.getPath()).num;
							sPartnerid = oContext.getModel().getProperty(
									oContext.getPath()).partnerid;

							var oTab = evt.getParameters().selectedItem;

							var sAuth = window.sessionStorage.getItem('Auth');

							var oBusyDialog = oView.byId("idBusyDialog");
							oBusyDialog.open();

							jQuery
									.ajax({
										type : 'GET',
										url : "/invoices/" + sPartnerid + "/"
												+ sNum,
										headers : {
											'Authorization' : sAuth
										},
										success : function(data, stat, xhdr) {
											if (xhdr.status == '200') {

												oTab
														.setModel(new sap.ui.model.json.JSONModel(
																data));
												oTab
														.bindElement("/invoiceDetails");
												// oView.setBusy(false);
												oBusyDialog.close();
											}
										},
										error : function(data, stat, xhdr) {
											alert("Access denied!");
											// oView.setBusy(false);
											oBusyDialog.close();
										}
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

						var sAuth = window.sessionStorage.getItem('Auth');
						var oModel = oContext.getModel();

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

						jQuery.ajax({
							type : 'POST',
							url : "/invoices",
							dataType : "json",
							contentType : "application/json; charset=utf-8",
							headers : {
								'Authorization' : sAuth
							},
							data : JSON.stringify(oObj),
							success : function(data, stat, xhdr) {
								if (xhdr.status == '200') {

									alert("Invoice approved");

								} else if (xhdr.status == '500') {
									alert("Error performing action!");
								}
							},
							error : function(data, stat, xhdr) {
								alert("Error performing action!");
							}
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
						var sAuth = window.sessionStorage.getItem('Auth');
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

						jQuery
								.ajax({
									type : 'POST',
									url : "/invoices",
									dataType : "json",
									contentType : "application/json; charset=utf-8",
									headers : {
										'Authorization' : sAuth
									},
									data : JSON.stringify(oObj),
									success : function(data, stat, xhdr) {
										if (xhdr.status == '200') {

											sap.m.MessageToast
													.show("Invoice has been successfully sent to External System");
											;

										} else if (xhdr.status == '500') {
											sap.m.MessageToast
													.show("Error while sending message to external system");
										}
									},
									error : function(data, stat, xhdr) {
										sap.m.MessageToast
												.show("Technical error!");
									}
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
