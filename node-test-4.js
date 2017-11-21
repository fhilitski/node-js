const http = require('http');

const hostname = '10.0.0.85';
const port = 3000;

const server = http.createServer();

server.on('request', (req, res) => {
  const {method, url, headers} = req; 

  res.statusCode = 200;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Powered-By', 'sleepless-nights');

  var html_out = [];
  html_out.push('<html>');
  html_out.push('<body>');
  html_out.push('<h1>Echo Chamber</h1>');  
  html_out.push('<h2>Got a  request!</h2>');
  html_out.push('<p>Method: ' + method + '</p>');
  html_out.push("<p>Url: " + url + "</p>");
  html_out.push("<p>Headers:</br>");
  html_out.push("user-agent: " + headers['user-agent']+"</p>");
  
  res.write(html_out.join(""));
  
  html_out = [];
  html_out.push("<p>Starting a long running process...</br>");
  res.write(html_out.join(""));
  
  /*simulate a long-running process*/
  var delay_ms = 30000;
  setTimeout(function(){
    res.write("Done!</p>");
    res.write("</body></html>");
    res.end();
  }, delay_ms);

  /* Listen for the 'error' on the request stream
     write the error stack to stderr
  */
  req.on('error', (err) => {
    console.error(new Date().getTime() + " ERROR: " + err.stack);
  });
  
  /*write simple request log to stdout */
  console.log(new Date().getTime() + ": Got a request");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
