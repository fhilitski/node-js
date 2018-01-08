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
var serve_html = (server_html_dir !== undefined);
if (!serve_html) {
  console.log('Please export SERVER_HTML_DIR ... ');
  console.log('Can not currently serve HTML');
}

const server = http.createServer();
server.on('request', function(req, res){
  const {method, url, headers, socket} = req; 
  /*write simple request log to stdout */
  console.log(new Date().getTime() + ": Got a request...");
  console.log("\t URL: " + url);
  console.log("\t user-agent: " + headers['user-agent']);
  console.log("\t socket: " + socket.remoteAddress + ':' + socket.remotePort);
  /*response header*/ 
  const header_json = {
    'Content-Type':'text/html',
    'X-Powered-By':'sleepless-nights'
  };
  res.writeHead(200, header_json); 
  
  /*url-dependent response*/
  var fname = ''; //this is a file to serve
  var file_serve = true; //flag indicating that a file should be served
  //var reg_event = false; //flag indicating that a new event listener should be registered
  var file_upload = false;

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
    case '/regevent':
      file_serve = false;
      //reg_event = true;
      reg_event();
      break;
    case '/firevent':
      file_serve = false;
      event_emitter.emit('stuff_happens');
      res.end('Envent has been fired: stuff happens!\n');
      break;
    case '/upload':
      file_serve = false;
      reg_event = false;
      file_upload = true;
      break;	
    default:
      fname = 'error.html'; 
  };  
  if (file_upload) {
      console.log(headers);
      var upload_file = fs.createWriteStream("upload_test.dat");
      var file_size = headers['content-length'];
      var uploaded_bytes = 0;
      var msg = 'Upload a file ('+ parseInt(file_size/1024, 10) + 'kB)...\n';
      console.log(msg);
      res.write(msg);
 
      req.on('readable', function(){
         var chunk = null;
         while( (chunk = req.read()) !== null ){
            uploaded_bytes += chunk.length;
            var progress = parseInt((uploaded_bytes/file_size)*100);
            res.write('Upload progress: ' + progress + '%\n');
         }
      });
      req.pipe(upload_file);
      req.on('end', function(){
         console.log('Done uploading!');
         res.end('Done!');
      });
  };
	
  if (file_serve && serve_html){
    //let's serve a file 
    fname = server_html_dir + '/' + fname;
    fs.readFile(fname, function(error, contents){
      console.log('Serving a file: ' + fname); 
      res.write(contents);
      res.end();
    });
  } else if (file_serve){
    /* can't serve html file - send a plain text message */
    console.log('Attempting to serve ' + fname + ' but the HTML server is not configured');
    res.end('This server is not configured to serve HTML pages...\n');
 };
 
function reg_event() {
    /*register a custom event*/
    res.write('Registering a custom event listener - event "stuff_happens"\n');
    console.log('Registering a custom event listener - event "stuff_happens"');
    event_emitter.on('stuff_happens',function(){
      console.log('Stuff\'s happened - event listener fired!');
      //res.write('Stuff Happened! \n');
      //res.end();
    });
    res.write(`To make stuff happen, call ${hostname}/firevent\n`);
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
});

server.listen(port, hostname, function(){
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log(`Server HTML root dir: ${server_html_dir}`);
});
