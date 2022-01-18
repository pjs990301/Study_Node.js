var express = require('express'),
    http = require('http'),
    path = require('path');

var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    static = require('serve-static'),
    errorHandler = require('errorhandler');

var expressErrorHandler = require('express-error-handler');

var expressSession = require('express-session');
var route_loader = require('./routes/route_loader');

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
