const Gdax = require('gdax');
const endpoint = 'https://api.gdax.com';

const publicClient = new Gdax.PublicClient(endpoint);
//const wsconn = new Gdax.WebsocketClient(['BTC-USD','ETH-BTC','ETH-USD'],endpoint);

const wsconn = new Gdax.WebsocketClient(['BTC-USD','ETH-BTC','ETH-USD']);
wsconn.on('message', function(data){
	console.log(data);
});

wsconn.on('error', function(data){
	console.log(data);
});

