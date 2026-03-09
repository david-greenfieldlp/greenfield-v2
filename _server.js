const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const PORT = process.env.PORT || 8080;
const mimes = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2'};
http.createServer((req,res)=>{
  let p = req.url.split('?')[0];
  if(p==='/' || p.endsWith('/')) p=p+'index.html';
  const fp = path.join(dir, decodeURIComponent(p));
  fs.readFile(fp,(err,data)=>{
    if(err){res.writeHead(404);res.end('Not found');return;}
    const ext = path.extname(fp).toLowerCase();
    res.writeHead(200,{'Content-Type':mimes[ext]||'application/octet-stream'});
    res.end(data);
  });
}).listen(PORT,()=>console.log('Serving on '+PORT));
