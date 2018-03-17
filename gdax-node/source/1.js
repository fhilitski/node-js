const Gdax = require('gdax');

const endpoint = 'https://api.gdax.com';
const publicClient = new Gdax.PublicClient(endpoint);

publicClient.getProducts(function(error, response, data){
  if (error) {
    console.log(error);// handle the error
  } else {
    // work with data
    //console.log(data);
  }
});

var market = 'BTC-USD';
publicClient.getProductTicker(market, function(error, response, data){
  if (error) {
    console.log(error);// handle the error
  } else {
    // work with data
    console.log(data);
  }
});


