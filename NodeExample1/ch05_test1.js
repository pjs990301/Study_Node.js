//ch05_test2.js
var http = require('http');
var host = '192.168.1.111';
var server = http.createServer();
var port = 3000;

server.listen(port,function (){
        console.log('웹 서버가 시작 되었습니다. %d', port);
    })

    server.on('request',function (req,res){
        console.log('클라이언트 요청이 들어왔습니다.');
        res.writeHead(200,{"Content-Type" : "text/html; charset = utf-8"});
    res.write("<HTML>");
    res.write("<head>");
    res.write("<title>Hello</title>");
    res.write("</head>");
    res.write("<body>");
    res.write("<h1>Hello node js</h1>");
    res.write("</body>");
    res.write("</html>");
    res.end();
})