const http = require('http');

const hostname = '10.0.0.85';
const port = 3000;

const server = http.createServer();

server.on('request', (req, res) => {
  const {method, url, headers} = req; 

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Powered-By', 'sleepless-nights');


  res.write('<html>');
  res.write('<body>');
  res.write('<h1>Echo Chamber</h1>');  
  html_out = '<p>Got a  request</p>';
  html_out = html_out + "<p>method: " + method + "</p>";
  html_out = html_out + "<p>url: " + url + "</p>";
  html_out = html_out + "<p>headers:</br>";
  html_out = html_out + "user-agent: " + headers['user-agent']+"</p>";
  res.write(html_out);
  res.write('</body>');
  res.write('</html>');
  res.end();

  /* Listen for the 'error' on the request stream
     write the error stac to stderr
  */
  req.on('error', (err) => {
    console.error(err.stack);
  });

  console.log(new Date().getTime() + " : Got a request");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
