const http = require('http');
const fs = require('fs');

const hostname = '10.0.0.85';
const port = 3000;
const server_html_dir = process.env.SERVER_HTML_DIR;
/*
 export SERVER_HTML_DIR to the environment - this is a root dir with HTLM pages to serve
*/

const server = http.createServer();

server.on('request', function(req, res){
  const header_json = {'Content-Type':'text/html','X-Powered-By':'sleepless-nights'};
  res.writeHead(200, header_json); 
  
  const {method, url, headers} = req; 
  
  var fname = 'index.html';
  if (url == '/') {
      fname = 'index.html';
  }
  else if (url == '/start.html?') {
      fname = 'action.html';
  } else {};
  fname = server_html_dir + '/' + fname;

  fs.readFile(fname, function(error, contents){
     res.write(contents);
     res.end();
  });

  /*simulate a long-running process*/
  /*
  var delay_ms = 30000;
  setTimeout(function(){
  }, delay_ms);
  */

  /* Listen for the 'error' on the request stream
     write the error stack to stderr
  */
  req.on('error', (err) => {
    console.error(new Date().getTime() + " ERROR: " + err.stack);
  });
  
  /*write simple request log to stdout */
  console.log(new Date().getTime() + ": Got a request... URL: " + url);
  console.log("\t"+"user-agent: " + headers['user-agent']);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log(`Server HTML root dir: ${server_html_dir}`);
});
