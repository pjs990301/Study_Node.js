//app2.js & app3.js
var express = require('express'), http = require('http');

var app = express();

app.use(function (req,res,next){
    console.log('첫 번째 미들웨어에서 요청을 처리');
    res.redirect('http://www.google.co.kr');
    //req.user = 'mike';
    //next();
    //res.writeHead('200',{'Content-Type':'text/html;charset=utf-8'});
    //res.end('<h1>Express 서버에서 응답한 결과입니다.');
});
app.use('/',function (req,res,next){
    console.log('두번째 미들웨어에서 요청을 처리');
    res.writeHead('200',{'Content-Type':'text/html;charset=utf-8'});
    res.end('<h1>Express 서버에서 ' + req.user+' 응답한 결과입니다.');
});

http.createServer(app).listen(3000,function (){
   console.log('Express 서버가 3000번 포트에서 시작됨.');
});

