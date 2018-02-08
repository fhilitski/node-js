const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();
publicClient
  .getProducts()
  .then(data => {
    // work with data
    console.log(data);
  })
  .catch(error => {
    // handle the error
    console.log(error);
  });

