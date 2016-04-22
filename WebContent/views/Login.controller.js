sap.ui.controller("views.Login", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf demopartner.Login
	 */
	//	onInit: function() {
	//
	//	},

	onLogin: function(evt) {
			var oController = this;
   
		
		var sAuth = 'Basic ' + btoa(this.getView().byId("idUser").getValue() + ':' + this.getView().byId("idPass").getValue());
				
			jQuery.ajax({
				type: 'GET',
				url: "/login",
				headers: {
					'Authorization': sAuth
				},
				success: function(data, stat, xhdr) {
					console.log("stat");
					console.log(xhdr.status);
					if (xhdr.status == '200') {
						
						//variant 1
						$.sap.require("jquery.sap.storage");  
            var UI5Storage = $.sap.storage(jQuery.sap.storage.Type.session);  
            UI5Storage.remove("Auth");  
            UI5Storage.put("Auth", sAuth);  
						
						//Variant2
						window.sessionStorage.setItem("Auth", sAuth);
						oController.App.to("idTiles");
					}
				},
				error: function(data, stat, xhdr) {
					alert("Access denied!");
				}
			});

		}
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf demopartner.Login
		 */
		//	onBeforeRendering: function() {
		//
		//	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf demopartner.Login
	 */
	//	onAfterRendering: function() {
	//
	//	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf demopartner.Login
	 */
	//	onExit: function() {
	//
	//	}

});