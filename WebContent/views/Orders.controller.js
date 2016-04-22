sap.ui.controller("views.Orders", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf demopartner.Orders
*/
	onInit: function() {
      		
		var oOrderForm =  sap.ui.view({
			id : "idOrderForm",
			viewName : "views.OrderForm",
			type : sap.ui.core.mvc.ViewType.XML
		});
    
		oOrderForm.getController().ParentController = this;
	
		oOrderForm.byId("Form1").setShowNavButton(sap.ui.Device.system.phone);
		
		this.getView().byId("idOrders").addDetailPage(oOrderForm.byId("Form1")); 
		this.getView().byId("idOrders").setInitialDetail(oOrderForm.byId("Form1"));
		
		
	},


	
	onOrderPress: function(evt, oData) {
		
		
		
		var oContext = evt.getSource().getBindingContext();
		
		var sForm1 = this.getView().byId("idOrders").getInitialDetail(); 
		
		this.getView().byId("idOrders").getPage(sForm1).setBindingContext(oContext);

		this.getView().byId("idOrders").hideMaster();
		
		this.getView().byId("idOrders").toDetail(sForm1);
		
		
	},
	
	navBack: function(evt) {
		this.AppController.navBack(); 
	}
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf demopartner.Orders
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf demopartner.Orders
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf demopartner.Orders
*/
//	onExit: function() {
//
//	}

});