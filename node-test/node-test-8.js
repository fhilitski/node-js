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
  var file_upload = false;
  var url_split_idx = url.indexOf('?'); 
  var url_command = url.substring(url.indexOf('/')+1, ((url_split_idx > -1) ? url_split_idx : url.length));
  console.log('URL command: '+url_command);
  switch (url_command){
    case '','index.html':
      fname = 'index.html';
      serve_file(fname);
      break;
    case 'start.html','action.html':
      fname = 'action.html';
      serve_file(fname);
      break;
    case 'favicon.ico':
      fname = 'favicon.ico';
      serve_file(fname);
      break;
    case 'regevent':
      reg_event();
      break;
    case 'firevent':
      event_emitter.emit('stuff_happens');
      res.end('Envent has been fired: stuff happens!\n');
      break;
    case 'upload':
      var dest_file = (url_split_idx > -1) ? url.substring(url_split_idx+1) : '';
      if (dest_file.length > 0) {upload_file(dest_file)} else {res.end('Please supply desination as /upload?<filename>\n');} ;
      break;	
    default:
      fname = 'error.html'; 
      serve_file(fname);
      break;
  };  
  function upload_file(dest_fname) {
      /* upload a file into dest_fname on the server */
      console.log(headers);
      console.log('File destanation: ' + dest_fname);
      var upload_file = fs.createWriteStream(dest_fname);
      var file_size = headers['content-length'];
      var uploaded_bytes = 0;
      var msg = 'Uploading '+ parseInt(file_size/1024, 10) + ' kB...\n';
      console.log(msg);
      res.write(msg);

      /*calculate progress using request.read() */ 
      req.on('readable', function(){
         var chunk = null;
         while( (chunk = req.read()) !== null ){
            uploaded_bytes += chunk.length;
            var progress = parseInt((uploaded_bytes/file_size)*100);
            res.write('Upload progress: ' + progress + '%\n');
         }
      });

      /*actually write a file by piping to WriteStream*/
      req.pipe(upload_file);
      req.on('end', function(){
         console.log('Done uploading!');
         res.end('Done!\n');
      });
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

function serve_file(file_name){
    if ( !serve_html) {
      /*can't serve html file - send a plain text message */
      console.log('Attempting to serve ' + fname + ' but the HTML server is not configured');
    } else {
     var fname = server_html_dir + '/' + file_name;
     var file_stream = fs.createReadStream(fname);
     file_stream.pipe(res);
     console.log('Serving a file: ' + fname); 
    };
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
