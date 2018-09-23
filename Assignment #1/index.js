/*
	* Primaru file for API
	*
	*
	*/

//Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// Instantiate the HTTP server
var httpServer = http.createServer(function(req,res){
	unifiedServer(req,res);
});

// Start the HTTP server
httpServer.listen(config.httpPort,function(){
	console.log("The server is listerning on port "+ config.httpPort);
});



// Instantiate the HTTPS server
var httpsServerOptions = {
	'key' : fs.readFileSync('./https/key.pem'),
	'cert' : fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions,function(req,res){
	unifiedServer(req,res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort,function(){
	console.log("The server is listerning on port "+ config.httpsPort);
});


// All the server login for both http and https server
var unifiedServer = function(req,res){

	// Get the URL to parse it
	var parsedUrl = url.parse(req.url,true);

	// Get the path
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');

	// Get the query string as an objects
	var queryStringObject = parsedUrl.query;

	// Get the HTTP Method
	var method = req.method.toLowerCase();

	// Get the Headers as an object
	var headers = req.headers;

	// Get the payload, if any
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	req.on('data',function(data){
		buffer  += decoder.write(data);
	});
	req.on('end',function(){
		buffer += decoder.end();

		//Chooose the handlers to this request should go to. If one is not found, use the notFound handler
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		//Construct the data object to send to the handler
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : buffer
		};

		//Route the request to the handler specified in the router
		chosenHandler(data,function(statusCode,payload){
			//use the status code called back by the handler, or default to 200
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;


			//use the payload called back by the handler, or default to an empty object
			payload = typeof(payload) == 'object' ? payload : {};

			//Convert the payload to a string
			var payloadString = JSON.stringify(payload);

			//Return the response
			res.setHeader('Content-Type','application/json')
			res.writeHead(statusCode);
			res.end(payloadString);

			console.log('Returning this response : ' , statusCode,payloadString);


		});
		// Send the response
		//res.end('Hello World!\n');

		// Log the request path
		//console.log('Request receive on path :'+trimmedPath + ' with method: ' + method+' and with these query string parameters',queryStringObject);
		//console.log('Request received with these headers', headers);
		
	});

};


//Define the handlers
var handlers = {};

//Ping handler
handlers.hello = function(data,callback){
	//Callback a http status code, and a payload object
	callback(200,{'Message':'Hai...! Welcome to my first REST API created using Perpil Master Class'});
};

//Not found handler 
handlers.notFound = function(data,callback){
	callback(404);
};
//Dwfine a request router
var router = {
	'hello' : handlers.hello

};