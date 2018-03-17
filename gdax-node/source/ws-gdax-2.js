const Gdax = require('gdax');

const endpoint = 'https://api.gdax.com';
const ws_endpoint = 'wss://ws-feed.gdax.com';
const ws_options ={ channels: [ 'ticker'] };
const ws_product_id = ['BTC-USD','ETH-USD','ETH-BTC']; 
//const ws_product_id = ['BTC-USD','BCH-BTC','BCH-USD'];


const publicClient = new Gdax.PublicClient(endpoint); 
//const wsconn = new Gdax.WebsocketClient(['BTC-USD','ETH-BTC','ETH-USD'],endpoint);
//const wsconn = new Gdax.WebsocketClient(['BTC-USD','ETH-BTC','ETH-USD']);
const wsconn = new Gdax.WebsocketClient(ws_product_id, ws_endpoint, null, ws_options);
var rates = [];

show_ticker();

function show_ticker(){
      wsconn.on('message', function(data){
        if (data.type == 'ticker') {
	   /* Process ticker data */
	   /*
             rates are store in a global object and 
	     are updated as new ticker data is streamed
	   */
	   update_rates(data);
           /* 
	     print profitability based on rates
           */
           print_profitability();
        }
	else {
	   /* Process non-ticker messages */ 
           //console.log(data.type);
        }
      });
};
 
wsconn.on('error', function(err){
         console.error(new Date().getTime() + "WS feed ERROR: " + err);
});


function update_rates(data){
 var ticker = data.product_id;
 var price = data.price;
 if (rates[ticker] != price){
   rates[ticker] = price;
 }
 //console.log(rates);
};

function print_profitability(){  
  /* let's check how many rates have been recorded */
  var n = Object.keys(rates).length;
  console.log('Rates obtained: ' + n);
  //route contains three exchange rates for circular cross-currency trade (CXT)
  var route = ['BTC-USD','ETH-BTC','ETH-USD'];
  //var route = ['BTC-USD','BCH-BTC','BCH-USD'];
  var prof = null;
  if (n == route.length){
     prof = 1;
     for (var r in rates){
        console.log(r+': '+rates[r]);
        if (route.indexOf(r) > -1) {
           //we care about this rate
           //console.log('relevant');
          if ((r == 'ETH-USD') || (r == 'BCH-USD')) {
            prof = prof * rates[r];
          } else {
            prof = prof / rates[r];
          }
        } 
     }
     console.log('Profitability: ' + prof);
  } else {
     console.log('Waiting for more rates...');
     console.log('Have now: ' + Object.keys(rates));  	
  }
}//end print_profitability()
