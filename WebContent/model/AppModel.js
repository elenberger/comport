jQuery.sap.require('sap.ui.core.BusyIndicator');

sap.ui.model.json.JSONModel.extend("comport.model.AppModel", {


	requestLogin : function(sAuth, callback) {
		this._sAuth = sAuth;
		var oModel = this;
		
		this._sendRequest("GET", "/login", {},
		// success
		function(data, stat, xhdr) {
			oModel.setProperty("/access", data);
			oModel.refresh();
			callback(xhdr.status, data );
		},
		// Error
		function(data, stat, xhdr) {
			callback(500);
		});
	},
	
	requestData : function(sEndpoint, callback) {
		this._sAuth = sAuth;
		var oModel = this;
		
		this._sendRequest("GET", sEndpoint, {},
		// success
		function(data, stat, xhdr) {
			oModel.setProperty(sEndpoint, data);
			callback(xhdr.status, data );
		},
		// Error
		function(data, stat, xhdr) {
			callback(500);
		});
	},

	postData : function(sEndpoint, oData, callback) {
		this._sAuth = sAuth;
		var oModel = this;
		
		this._sendRequest("POST", sEndpoint, oData,
		// success
		function(data, stat, xhdr) {
			callback(xhdr.status, data );
		},
		// Error
		function(data, stat, xhdr) {
			callback(500);
		});
	},
	
// ---private section
	
	// send request

	_sendRequest : function(sType, sEndPoint, oData, success, error) {

		sAuth = this._getAuth();
		
		sap.ui.core.BusyIndicator.show(500);
		
		jQuery.ajax({
			type : sType,
			url : sEndPoint,
			headers : {
				'Authorization' : sAuth
			},
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			data: JSON.stringify(oData),
			success : function(data, stat, xhdr){
				sap.ui.core.BusyIndicator.hide();
				success(data, stat, xhdr);
				}, // data, stat, xhdr
			error : function(data, stat, xhdr) { 
				sap.ui.core.BusyIndicator.hide();
				error(data, stat, xhdr) }
		// data, stat, xhdr
		});
	},	

	_getAuth : function() {
		return this._sAuth;
	}

});