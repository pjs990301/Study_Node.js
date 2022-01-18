var express = require('express'),
    http = require('http'),
    path = require('path');

var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    static = require('serve-static'),
    errorHandler = require('errorhandler');

var expressErrorHandler = require('express-error-handler');

var config = require('./config');
var expressSession = require('express-session');
var route_loader = require('./routes/route_loader');
var database = require('./database/database');



var app = express();
app.set('views', __dirname + './views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정');

console.log('config.server_port : %d', config.server_port);
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/public',static (path.join(__dirname,'public')));
app.use(cookieParser());

app.use(expressSession({
    secret : 'my key',
    resave:true,
    saveUninitialized : true
}));

route_loader.init(app,express.Router());

var errorhandler = expressErrorHandler({
    static : {
        '404':'./public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorhandler);

process.on('uncaughtException',function (err){
    console.log('uncaughtException' + err);
    console.log('서버 프로세스 종료하지 않고 유지');
    console.log(err.stack);
});

process.on('SIGTERM',function (){
    console.log('프로세스 종료');
    app.close();
});

app.on('close',function (){
    console.log("express 서버 객체가 종료됩니다");
    if(database.db){
        database.db.close();
    }

});

var server = http.createServer(app).listen(app.get('port'),function (){
    console.log('서버 시작 포트 : ' + app.get('port'));

    database.init(app,config);
});



