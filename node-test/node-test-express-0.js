var http = require('http');
var request = require('request');
var url = require('url');
var express = require('express');

var msg = 'msg';
var options = {
	//host : 'www.fhilitski.com',
	protocol : 'https:',
	host : 'api.gdax.com',
	path : '/',
	method : 'GET'
};

var r_url = url.format(options);
console.log('Url: ' + r_url);

var app = express();
app.get('/', function(req, resp){
	request(r_url).pipe(resp)
});
app.listen(8080);
/*
var r = request.get(r_url, function(error, response, body){
	console.log('Body: \n' + body);
	console.log('Resp: \n' + response);
	console.log('Error:\n' + error);
});
*/

