var querystring = require('querystring');
var http = require('http');

var host = '1d.ddns.net';
var port = '8005';
var username = 'developer1';
var password = 'Summer2016!';

var sAuth = 'Basic ';
    sAuth += new Buffer(username + ':' + password).toString('base64');

//var apiKey = '*****';
//var sessionId = null;
//var deckId = '68DC5A20-EE4F-11E2-A00C-0858C0D5C2ED';

function performGetRequest(endpoint, data, success) {
  var dataString = JSON.stringify(data);
  var headers = {'Authorization': sAuth};
  
    
      var options = {
    host: host,
    port: port,      
    path: endpoint,
    method: "GET",
    headers: headers
  };
    
    var req = http.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      console.log(responseString);
      var responseObject = JSON.parse(responseString);
      success(responseObject);
    });
  });

  //req.write(dataString);
  req.end();
  req.on('error', function(error){
     console.log(error); 
  });    
}

module.exports.performGetRequest = performGetRequest;