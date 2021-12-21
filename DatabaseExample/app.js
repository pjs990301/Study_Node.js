var express = require('express');
var http = require('http');
var path = require('path');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var static = require('serve-static');
var errorHandler = require('errorhandler');

var expressErrorHandler = require('express-error-handler');
var expressSession = require('express-session');

var app = express();
app.set('port',3000);
app.use(bodyParser,urlencoded({extended:false}));

app.use(bodyParser.json());
app.use('/public',static(path.join(__dirname,'public')));

app.use(cookieParser());

app.use(expressSession({
    secret : 'my key',
    resave : true,
    saveUninitialized : true
}));
var mongoClient = require('mongodb').MongoClient;

var database;

function connectDB(){
    var databaseUrl = 'mongodb://localhost:27017/local';

    MongoClient.connect(databaseUrl,function (err,db){
        if(err) throw err;
        console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
        database = db;
    });

}


var router = express.Router();

router.route('/process/login').post(function (req, res){
    console.log('/process/login 호출');
})

app.use('/',router);

var errorHandler = expressErrorHandler({
    static:{
        '404':'./public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

http.createServer(app).listen(app.get('port'),function (){
    console.log('서버가 시작'+ app.get('port'));
    connectDB();
})

