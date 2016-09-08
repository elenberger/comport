var querystring = require('querystring');
var http = require('http');
var extsys = require('../settings').extsys;

var host = extsys.host;
var port = extsys.port;
var username = extsys.username;
var password = extsys.password;

var sAuth = 'Basic ';
sAuth += new Buffer(username + ':' + password).toString('base64');

// var apiKey = '*****';
// var sessionId = null;
// var deckId = '68DC5A20-EE4F-11E2-A00C-0858C0D5C2ED';

function performGetRequest(endpoint, data, success, error) {
	var dataString = JSON.stringify(data);
	var headers = {
		'Authorization': sAuth
	};

	var options = {
		host: host,
		port: port,
		path: endpoint,
		method: "GET",
		headers: headers
	};

	var req = http.request(options, function (res) {
		res.setEncoding('utf-8');

		var responseString = '';

		res.on('data', function (data) {
			responseString += data;
		});

		res.on('end', function () {
			try {
				var responseObject = JSON.parse(responseString);
				success(responseObject);
			} catch (e) {
				var responseObject = {
					"error": "unexpected response from server"
				};
				return error(responseObject);
			}

		});
	});

    req.setTimeout(60000, function () {
		return error({ "error": "Server is unreachable" });
	});
	// req.write(dataString);
	req.end();
	req.on('error', function (err) {
		console.log(err);
		error(err);
	});
};

function performPostRequest(endpoint, data, success, error) {
	var dataString = JSON.stringify(data);
	var headers = {
		'Authorization': sAuth,
		'Content-Type': 'application/json',
		'Content-Length': Buffer.byteLength(data)
	};

	var options = {
		host: host,
		port: port,
		path: endpoint,
		method: "POST",
		headers: headers
	};

	var req = http.request(options, function (res) {
		res.setEncoding('utf-8');

		var responseString = '';

		res.on('data', function (data) {
			responseString += data;
		});

		res.on('end', function () {
			var responseObject = JSON.parse(responseString);
			success(responseObject);
		});
	});

	req.write(dataString);
	req.end();
	req.on('error', function (err) {
		error(err);
	});

}

// SAP Specific posting

function performPostRequestSAP(endpoint, data, success, error) {

	var oGetRequest = new Promise(function (resolve, reject) {

		var headers = {
			'Authorization': sAuth,
			'x-csrf-token': "fetch"
		};

		var options = {
			host: host,
			port: port,
			path: endpoint,
			method: "GET",
			headers: headers
		};

		var req = http.request(options, function (res) {

			resolve(res);

		});

		req.setTimeout(60000, function () {
			return reject({ "error": "Server is unreachable" });
		});
		req.end();
		req.on('error', function (error) {
			return reject(error);
		});

	});

	oGetRequest.then(
		// resolve
		function (oGetRes) {

			var dataString = JSON.stringify(data);

			var headers = {};
			headers['Authorization'] = sAuth;
			headers['Accept-Language'] = 'en';
			headers['X-Requested-With'] = "XMLHttpRequest";
			headers['Content-Type'] = 'application/json';
			headers['X-CSRF-Token'] = oGetRes.headers['x-csrf-token'];
			headers['cookie'] = oGetRes.headers['set-cookie']; //array should be converted to string with ; delimers?

			//headers['content-length'] = Buffer.byteLength(data);

			var options = {
				host: host,
				port: port,
				path: endpoint,
				method: "POST",
				headers: headers
			};

			var req = http.request(options, function (res) {


				if (res.statusCode !== 200) return error({ "error": "unexpected response from server" });


				res.setEncoding('utf-8');

				var responseString = '';

				res.on('data', function (data) {
					responseString += data;
				});

				res.on('end', function () {
					try {

						var responseObject = { response: JSON.parse(responseString) };
						success(responseObject);
					} catch (e) {
						return error({ "error": "Cannot parse response from server" });
					}
				});
			});

			req.write(dataString);
			req.end();
			req.on('error', function (error) {
				error(error);
			});

		},

		// reject
		function (err) {
			return error(err);
		});

}

module.exports.performGetRequest = performGetRequest;
module.exports.performPostRequest = performPostRequest;
module.exports.performPostRequestSAP = performPostRequestSAP;
