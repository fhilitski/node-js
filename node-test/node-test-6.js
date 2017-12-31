const http = require('http');
const fs = require('fs');
const event_emitter_class = require('events').EventEmitter;
var event_emitter = new event_emitter_class();

const hostname = '10.0.0.85';
const port = 3000;
const server_html_dir = process.env.SERVER_HTML_DIR;
/*
 export SERVER_HTML_DIR to the environment - this is a root dir with HTLM pages to serve
*/
if (server_html_dir === undefined) {
  console.log('Please export SERVER_HTML_DIR ... ');
}
const server = http.createServer();
server.on('request', function(req, res){
  const header_json = {
    'Content-Type':'text/html',
    'X-Powered-By':'sleepless-nights'
  };
  
  res.writeHead(200, header_json); 
  
  const {method, url, headers, socket} = req; 
  
  var fname = ''; //this is a file to serve
  var file_serve = true; //flag indicating that a file should be served
  var reg_event = false; //flag indicating that a new event listener should be registered
  switch (url) {
    case '/':
      fname = 'index.html';
      break;
    case '/start.html?':
      fname = 'action.html';
      break;
    case '/favicon.ico':
      fname = 'favicon.ico';
      break;
    case '/regevent?':
      file_serve = false;
      reg_event = true;
      break;
    case '/firevent':
      file_serve = false;
      event_emitter.emit('stuff_happens');
      res.write('Stuff happened!');
      res.end();	
      break;
    default:
      fname = 'error.html'; 
  };
  
  if (file_serve){
    //let's serve a file 
    fname = server_html_dir + '/' + fname;
    fs.readFile(fname, function(error, contents){
      res.write(contents);
      res.end();
    });
  }
 if (reg_event) {
    //let's register a custom event
    res.write('registering a custom event listener - event "stuff_happens"<br>');
    event_emitter.on('stuff_happens',function(){
      console.log('Stuff happens - event listener fired!');
    });
    res.write('To make stuff happen, <a href="/firevent" target = "_blank">click here</a>!');
    res.end();
};

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
  console.log("\t"+"socket: " + socket.remoteAddress + ':' + socket.remotePort);
});

server.listen(port, hostname, function(){
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log(`Server HTML root dir: ${server_html_dir}`);
});
