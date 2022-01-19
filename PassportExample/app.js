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

var passport = require('passport');
var flash = require('connect-flash');

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

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

var LocalStrategy = require('passport-local').Strategy;

passport.use('local-login',new LocalStrategy({
    usernameFiled : 'email',
    passwordField : 'password',
    passReqToCallback :true
}, function (req, email, password, done){
    console.log('passport local-login 호출 : ' + email + ", " + password);

    var database = app.get('database');
    database.UserModel.findOne({'email':email},function (err,user){
        if(err) {return done(err);}

        if(!user){
            console.log('계정이 일치하지 않음');
            return done (null, false, req.flash('loginMessage','등록된 계정이 없습니다.'));

        }
        var authenticated = user.authenticate(password,user._doc.salt,user._doc.hashed_password);
        if(!authenticated){
            console.log('비밀번호 일치하지 않음');
            return  done(null,false, req.flash('loginMessage','비밀번호가 일치하지 않음'));
        }
        console.log('계정과 비밀번호가 일치');
        return done(null,user);
    });
}));


var server = http.createServer(app).listen(app.get('port'),function (){
    console.log('서버 시작 포트 : ' + app.get('port'));

    database.init(app,config);
});



