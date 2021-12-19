var http = require('http');

var server = http.createServer();

var port = 3000;

server.listen(port,function (){
   console.log('웹 서버가 시작되었습니다. %d',port);
});

server.on('connection',function (socoket){
   var addr = socoket.address();
   console.log('클라이언트가 접속했습니다 %s %d',addr.address,addr.port);
})

server.on('request',function (req,res){
   console.log('클라이언트 요청이 들어왔습니다.');
   res.writeHead(200,{"Content-Type" : "text/html; charset = utf-8"});
   res.write("<!DOCTYPE HTML>")
   res.write("<HTML>");
   res.write("<head>");
   res.write("<title>응답페이지</title>");
   res.write("</head>");
   res.write("<body>");
   res.write("<h1>노드제이에스</h1>");
   res.write("</body>");
   res.write("</html>");
   res.end();
});

server.on('close',function(){
   console.log('서버가 종료됩니다.');
});