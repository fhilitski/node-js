'use strict';

const Gdax = require('gdax');
/*
More info here:
/github.com/coinbase/gdax-node/
*/

const endpoint = 'https://api.gdax.com'; //gdax api endpoint
const ws_endpoint = 'wss://ws-feed.gdax.com'; //gdax ws endpoint
const ws_options ={ channels: [ 'ticker'] };
const ws_product_id = ['BTC-USD','ETH-USD','ETH-BTC']; 
//const ws_product_id = ['BTC-USD','BCH-BTC','BCH-USD'];
/* 
This app does not use gdax API
only websocket feed
*/
//const publicClient = new Gdax.PublicClient(endpoint); 

//const wsconn = new Gdax.WebsocketClient(['BTC-USD','ETH-BTC','ETH-USD'],endpoint);
//const wsconn = new Gdax.WebsocketClient(['BTC-USD','ETH-BTC','ETH-USD']);
var wsconn = new Gdax.WebsocketClient(ws_product_id, ws_endpoint, null, ws_options);

/*
use redis.io for logging connections to ticker websocket feed
*/
var log_redis = require('redis');
/*
we need to have redis server installed/confgured first
*/
//var log_client = log_redis.createClient();

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

const hostname = '10.0.0.85';
const port = 3000;
const server_html_dir = process.env.SERVER_HTML_DIR;

var rates = []; //Global variable for recording exchange rate
var got_clients = false; //set to true of clients are connected to socket.io
var timestamp, m_timestamp = null;

var moment = require('moment'); //moment.js for timestamp formatting

/*
 export SERVER_HTML_DIR to the environment - this is a root dir with HTLM pages to serve
*/
var serve_html = (server_html_dir !== undefined);
if (!serve_html) {
  console.log('Please export SERVER_HTML_DIR ... ');
  console.log('Can not serve HTML pages');
};

if (serve_html) {
   /* Serve ticker page */
   app.get('/ticker', function(req, res){
      console.log(`serving ${server_html_dir}/index.html`); 
      res.sendFile(server_html_dir + '/ticker.html');
   });

   /* Start http server */
   server.listen(port, hostname, function(){
      console.log(`Server running at http://${hostname}:${port}/`);
      console.log(`Server HTML root dir: ${server_html_dir}`);
   });
}

/* update client info on connection */
io.on('connection', function(socket) {
  var socket_ip = socket.conn.remoteAddress;
  var msg = get_ts_string() + ':  Connected id: ' + socket.id + ' from '+ socket_ip;
   console.log(msg);
   socket.emit('msg-connect', { status : 'connected', id : socket.id, remote_addr : socket_ip});
   got_clients = true;	
});

/* update client on reconnect */
io.on('reconnect', function(client) {
   var msg = get_ts_string() + ':  Re-connected id: ' + client.id;
   console.log(msg);
   client.emit('msg-connect', { status : 'connected', id : client.id});
   got_clients = true;	
});

/*
If WS feed broadcasts error, log and send it to all clients
*/
wsconn.on('error', function(err){
       var msg = get_ts_string() + "WS feed ERROR: " + err;	  
       console.error(msg);
       io.sockets.emit('msg-info', {data : msg});	
});

wsconn.on('open', function() {
	var msg = get_ts_string() + ': WS GDAX connection opened';
	console.log(msg);
	io.sockets.emit('msg-info', {data:msg});
});

wsconn.on('close', function() {
	var msg = get_ts_string() + ': WS GDAX connection closed';
	console.log(msg);
        io.sockets.emit('msg-info', {data : msg});
	//attmept to re-connect
	wsconn.connect();
});

/*
Outputs currently obtained tickers to the console
and broadcasts to all connected websocket clients with broadcase == true 
*/
wsconn.on('message', function(data){
   if (data.type == 'ticker') {
   /* Process ticker data:
      rates are stored in a global object and 
      are updated as new ticker data is streamed
   */
   update_rates(data);
   
   /* print profitability based on rates
      and broadcast it to connected clients
   */
   print_profitability();
   }
   else {
   /* Process non-ticker messages */ 
   console.log(get_ts_string() + ": " + data.type);
   }
});
 
/* 
Helper function:
 update global rates and timestamp (with m_timestamp) variables
 emit msg-rate event to connected clients (sockets)
*/
function update_rates(data){
   var ticker = data.product_id;
   var price = data.price;
   //only update and emit events if there is a change of rate
   if (rates[ticker] != price){
      rates[ticker] = price;
      //console.log(rates); //debug
      io.sockets.emit('msg-rate', {
         market : ticker,
         rate : parseFloat(price).toFixed(2),
         timestamp : get_ts_string() 
      });
   }	
};

/* 
Helper function:
  print exchange rates
  caluclates and prints profitability
*/
function print_profitability(){  
  // let's check how many rates have been recorded
  var n = Object.keys(rates).length; 
  //console.log(timestamp + ': ');
  //console.log('\tRates obtained: ' + n);
  //route contains three exchange rates for circular cross-currency trade (CXT)
  var route = ['BTC-USD','ETH-BTC','ETH-USD'];
  //var route = ['BTC-USD','BCH-BTC','BCH-USD'];
  var prof = null;
  if (n == route.length){
     prof = 1;
     for (var r in rates){
        //console.log(r+': '+rates[r]); //debug: output rates to the console
        if (route.indexOf(r) > -1) {
          if ((r == 'ETH-USD') || (r == 'BCH-USD')) {
            prof = prof * rates[r];
          } else {
            prof = prof / rates[r];
          }
        } 
     }
     //console.log('\tProfitability: ' + prof);
     io.sockets.emit('msg-prof', { profitability : parseFloat(prof).toFixed(5)});
   } 
   else {
     /* need three rates to get profitability score */
     var msg1 = timestamp + ':\n\tWaiting for more rates... ';
     var msg2 = '\tHave now: ' + Object.keys(rates);
     console.log(msg1);
     console.log(msg2);
     io.sockets.emit('msg-info', { data : msg1+msg2 });   	
   }
}//end print_profitability()

/*
function get_ts_string() 
returns  timestamp string formatted as MM/DD/YYYY HH:mm:ss Z
*/
function get_ts_string(){
   var timestamp  = new Date(); //record a timestamp
   var m_timestamp = moment(timestamp);  
   return m_timestamp.format("MM/DD/YYYY HH:mm:ss Z");
}
