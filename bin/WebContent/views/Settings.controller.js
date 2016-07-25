sap.ui.controller("views.Settings", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf demopartner.Settings
*/
	onInit: function() {
     
    var oModel = new sap.ui.model.json.JSONModel();
    
    this.getView().setModel(oModel);
    

    //Fetch users 
    
 // Call REST async
	var sAuth = window.sessionStorage.getItem('Auth');
	var oController = this;

	jQuery.ajax({
		type : 'GET',
		url : "/users",
		headers : {
			'Authorization' : sAuth
		},
		success : function(data, stat, xhdr) {
			if (xhdr.status == '200') {

				oModel.setData(data, true);

			}
		},
		error : function(data, stat, xhdr) {
			alert("Access denied!");
		}
	});
    

	jQuery.ajax({
		type : 'GET',
		url : "/partners",
		headers : {
			'Authorization' : sAuth
		},
		success : function(data, stat, xhdr) {
			if (xhdr.status == '200') {

				oModel.setData(data, true);

			}
		},
		error : function(data, stat, xhdr) {
			alert("Access denied!");
		}
	});
	
		
	},

	onNavBack: function(evt) {
		this.AppController.navBack();
	},
	
	onUserDetails: function(evt){
		var oContext = evt.getSource().getBindingContext();
		this.getView().byId("pageUsersDetails").setBindingContext(oContext);
	},
	onPartnerDetails: function(evt){
		var oContext = evt.getSource().getBindingContext();
		this.getView().byId("pagePartnersDetails").setBindingContext(oContext);
	}

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf demopartner.Settings
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf demopartner.Settings
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf demopartner.Settings
*/
//	onExit: function() {
//
//	}

});