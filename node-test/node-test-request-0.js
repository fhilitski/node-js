var http = require('http');
var request = require('request');
var url = require('url');

var msg = 'msg';
var options = {
	//host : 'www.fhilitski.com',
	protocol : 'https:',
	host : 'api.gdax.com',
	path : '/',
	method : 'GET',
        headers: {
   		 'User-Agent': 'XX_007'
 	 }
};

options.uri  = url.format(options);
console.log('Url: ' + options.uri);


var r = request(options, function(error, response, body){
	console.log('Body: \n' + body);
	console.log('Resp: \n' + response);
	console.log('Error:\n' + error);
});

