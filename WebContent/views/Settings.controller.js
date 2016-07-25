sap.ui.controller("views.Settings", {
 
	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf demopartner.Settings
	 */
	onInit : function() {
		"use strict";

		this._sPartnerMode = 'R';
		this._sUserMode = 'R';

		var oModel = new sap.ui.model.json.JSONModel();

		this.getView().setModel(oModel);

		this.fetchUsers();
		this.fetchPartners();
	
	},
	
	fetchUsers: function(){
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
					oController.getView().getModel().setProperty("/users", data.users);
				}
			},
			error : function(data, stat, xhdr) {
	         // alert("Error while getting partners");
			}
		});
		
	},
	
	fetchPartners: function(){
		
		var sAuth = window.sessionStorage.getItem('Auth');
		var oController = this;
		
		jQuery.ajax({
			type : 'GET',
			url : "/partners",
			headers : {
				'Authorization' : sAuth
			},
			success : function(data, stat, xhdr) {
				if (xhdr.status == '200') {
					oController.getView().getModel().setProperty("/partners", data.partners);
				}
			},
			error : function(data, stat, xhdr) {
				alert("Error while getting partners");
			}
		});
	},

	onNavBack : function(evt) {
		this.AppController.navBack();
	},

	onUserDetails : function(evt) {
		var oContext = evt.getSource().getBindingContext();
		this.getView().byId("pageUsersDetails").setBindingContext(oContext);
	},
	onPartnerDetails : function(evt) {
		var oContext = evt.getSource().getBindingContext();
		this.getView().byId("pagePartnersDetails").setBindingContext(oContext);
	},

	changePartnerPageState : function(sState) {
		var aElems = [ "inp_partnername", "inp_address", "inp_email",
				"inp_comment" ];

		this._sPartnerMode = sState;

		for (let elem of aElems) {
			this.getView().byId(elem).setEnabled(false);
		}
		
		this.getView().byId("toolbarPartnerModify").setVisible(false);

		if (sState === "C" || sState === "U") {
			for (let elem of aElems) {
				this.getView().byId(elem).setEnabled(true);
			}
			this.getView().byId("toolbarPartnerModify").setVisible(true);
		}

	},

	onAddPartner : function(evt) {
      // Insert epty element
	var oModel = this.getView().getModel();
	var aPartners = oModel.getProperty("/partners");
	var iIndex = aPartners.push({});
	    iIndex -= 1; 
	
	var sPath = "/partners/" + iIndex;
	
	var oContext = oModel.createBindingContext(sPath);
	
	this.changePartnerPageState("C");
	
	this.getView().byId("pagePartnersDetails").setBindingContext(oContext);
	
	},

	onUpdatePartner : function(evt) {
		this.changePartnerPageState("U");
	},

	onDeletePartner : function(evt) {
		this._sPartnerMode = 'D';
		this.onSavePartner(evt);

	},

	onSavePartner : function(evt) {
		var oContext = this.getView().byId("pagePartnersDetails")
				.getBindingContext();
		var oModel = oContext.getModel();
		oObj = oModel.getProperty("", oContext);

		// Data to server

		var oData = {
			operation : this._sPartnerMode,
			partner : oObj
		};

		// call rest
		this.callPartnerUpdate(oData);
		this.changePartnerPageState("R");		

	},
	onDeclinePartner : function(evt) {
     // change mode to R and reread data from DB.
	 	
		this.changePartnerPageState("R");
		this.fetchPartners();
		
	},
	
	
	callPartnerUpdate: function(oData) {
		
		var sAuth = window.sessionStorage.getItem('Auth');
		var oController = this;

		switch (oController._sPartnerMode) {
			case "C":
				sMessage = 'Partner has been created';
				break;

			case "U":
				sMessage = 'Partner has been updated';
				break;
			case "D":
				sMessage = 'Partner has been deleted';
				break;
			default:
				sMessage = 'Something wrong...';
				break;
		}
		
		
		jQuery.ajax({
			type : 'POST',
			url : "/partners",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			headers : {
				'Authorization' : sAuth
			},
			data : JSON.stringify(oData),
			success : function(data, stat, xhdr) {
				if (xhdr.status == '200') {
					
					oController.fetchPartners();
					
                   sap.m.MessageToast.show(sMessage);
				
				} else if (xhdr.status == '500') {
					sap.m.MessageToast.show("Error performing action!");
				}
			},
			error : function(data, stat, xhdr) {
				sap.m.MessageToast.show("Error performing action!");
			}
		});
	},
	
// --------USERS
// ///////////////////////////////////////

	changeUserPageState : function(sState) {
		var aElems = [ "inpu_userid", "inpu_name", "inpu_email", "inpu_address",
				"inpu_comment", "rolesInput"  ];

		this._sUserMode = sState;

		for (let elem of aElems) {
			this.getView().byId(elem).setEnabled(false);
		}
		
		this.getView().byId("toolbarUserModify").setVisible(false);
		this.getView().byId("toolbarPartnerAssignment").setVisible(false);

		if (sState === "C" || sState === "U") {
			for (let elem of aElems) {
				this.getView().byId(elem).setEnabled(true);
			}
			this.getView().byId("toolbarUserModify").setVisible(true);
			this.getView().byId("toolbarPartnerAssignment").setVisible(true);
		}

	},
	
	onAddUser : function(evt) {
	      // Insert epty element
		var oModel = this.getView().getModel();
		var aUsers = oModel.getProperty("/users");
		var iIndex = aUsers.push({});
		    iIndex -= 1; 
		
		var sPath = "/users/" + iIndex;
		
		var oContext = oModel.createBindingContext(sPath);
		
		this.changeUserPageState("C");
		
		this.getView().byId("pageUsersDetails").setBindingContext(oContext);
		
		},

		onUpdateUser : function(evt) {
			this.changeUserPageState("U");
		},

		onDeleteUser : function(evt) {
			this._sUserMode = 'D';
			this.onSaveUser(evt);

		},

		onSaveUser : function(evt) {
			var oContext = this.getView().byId("pageUsersDetails")
					.getBindingContext();
			var oModel = oContext.getModel();
			oObj = oModel.getProperty("", oContext);

			// Data to server

			var oData = {
				operation : this._sUserMode,
				user : oObj
			};

			// call rest
			this.callUserUpdate(oData);
				

		},
		onDeclineUser : function(evt) {
	     // change mode to R and reread data from DB.
		 	
			this.changeUserPageState("R");
			this.fetchUsers();
			
		},
		
		
		callUserUpdate: function(oData) {
			
			var sAuth = window.sessionStorage.getItem('Auth');
			var oController = this;


			jQuery.ajax({
				type : 'POST',
				url : "/users",
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				headers : {
					'Authorization' : sAuth
				},
				data : JSON.stringify(oData),
				success : function(data, stat, xhdr) {
					if (xhdr.status == '200') {
						
						// Update assignments;
						
						oController.callUserAssignmentUpdate(oData, oController);
						
					
					} else if (xhdr.status == '500') {
						sap.m.MessageToast.show("Error performing action!");
					}
				},
				error : function(data, stat, xhdr) {
					sap.m.MessageToast.show("Error performing action!");
				}
			});
		},


callUserAssignmentUpdate: function(oData, oController) {
			
			var sAuth = window.sessionStorage.getItem('Auth');

			switch (oController._sUserMode) {
				case "C":
					sMessage = 'User has been created';
					break;

				case "U":
					sMessage = 'User has been updated';
					break;
				case "D":
					sMessage = 'User has been deleted';
					break;
				default:
					sMessage = 'Something wrong...';
					break;
			}
			
			var aPartners = [];
			
			for (j=0; j<oData.user.partners.length; j++){
				aPartners.push(oData.user.partners[j].partner.partnerid);
			}
			
			var oObj = {
					userid: oData.user.userid,
					partners: aPartners
			};
			
			jQuery.ajax({
				type : 'POST',
				url : "/assignpartner",
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				headers : {
					'Authorization' : sAuth
				},
				data : JSON.stringify(oObj),
				success : function(data, stat, xhdr) {
					if (xhdr.status == '200') {
						
						oController.changeUserPageState("R").bind(oController);					
						oController.fetchUsers();
						sap.m.MessageToast.show(sMessage);
						
	                
					} else if (xhdr.status == '500') {
						sap.m.MessageToast.show("Error performing action!");
					}
				},
				error : function(data, stat, xhdr) {
					sap.m.MessageToast.show("Error performing action!");
				}
			});
		},
	
	/**
	 * Similar to onAfterRendering, but this hook is invoked before the
	 * controller's View is re-rendered (NOT before the first rendering!
	 * onInit() is used for that one!).
	 * 
	 * @memberOf demopartner.Settings
	 */

// / DIALOG With partner
	_getPartnerSH_Dlg: function() {
		if (!this._oPartnerSH_Dlg) {
            this._oPartnerSH_Dlg = sap.ui.xmlfragment("views.PartnerSH", this);
            this.getView().addDependent(this._oPartnerSH_Dlg);
         }
         return this._oPartnerSH_Dlg;
	},
	
	_openPartnerSH_Dlg: function() {
		this._getPartnerSH_Dlg().open();
	},
	
	onClosePartnerSH_Dlg: function() {
		this._getPartnerSH_Dlg().close();
	}, 
		
	onBeforeRendering : function() {
		this.changePartnerPageState(this._sPartnerMode);
	},
	
	onSubmitPartnerSH_Dlg: function() {

		var sKey = sap.ui.getCore().byId("partnersh_combo").getSelectedItem().getKey();
		var sValue = sap.ui.getCore().byId("partnersh_combo").getSelectedItem().getText();
		
        var oContext = this.getView().byId("pageUsersDetails").getBindingContext();
        var oModel = oContext.getModel();
        var oUser = oModel.getProperty("", oContext);
        
        if (!oUser.partners) oUser.partners = [];
        
        oUser.partners.push({partner: {partnerid: sKey, partnername: sValue} });
        
        this._getPartnerSH_Dlg().close();
        
        oModel.refresh();
        
        
	},
	
	onAddPartnerAssignment: function(evt) {
		
		this._openPartnerSH_Dlg();
		
	},
	onRemovePartnerAssignment: function(evt) {
	    var oTable = this.getView().byId("tableUserPartners"); 
		var oItem = oTable.getSelectedItem();
	if (oItem) {
     var oTableContext = oTable.getBindingContext();	
	 var oItemContext = oItem.getBindingContext();
	 var oModel   = oTableContext.getModel();
	 
	 var aPartners  = oModel.getProperty("", oTableContext).partners;
	     sPartneid   = oModel.getProperty("", oItemContext).partner.partnerid;
	     
	     for (var j=0; j<aPartners.length; j++) {
	    	 if (aPartners[j].partner.partnerid === sPartneid) {
	    		 aPartners.splice(j,1);
	    		 break;
	    	 }
	     }
	     
		 oModel.refresh(); 
	}
	},

/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf demopartner.Settings
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf demopartner.Settings
 */
// onExit: function() {
//
// }
});