const http = require('http');

const hostname = '10.0.0.85';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  html_out = 'Hello World\n Got request...';
  html_out = html_out + req.toString();
  res.end(html_out);
  
  console.log(req);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
