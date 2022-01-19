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

app.use('/public', static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));

route_loader.init(app, express.Router());

var errorhandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorhandler);

process.on('uncaughtException', function (err) {
    console.log('uncaughtException' + err);
    console.log('서버 프로세스 종료하지 않고 유지');
    console.log(err.stack);
});

process.on('SIGTERM', function () {
    console.log('프로세스 종료');
    app.close();
});

app.on('close', function () {
    console.log("express 서버 객체가 종료됩니다");
    if (database.db) {
        database.db.close();
    }

});

var LocalStrategy = require('passport-local').Strategy;

passport.use('local-login', new LocalStrategy({
    usernameFiled: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    console.log('passport local-login 호출 : ' + email + ", " + password);

    var database = app.get('database');
    database.UserModel.findOne({'email': email}, function (err, user) {
        if (err) {
            return done(err);
        }

        if (!user) {
            console.log('계정이 일치하지 않음');
            return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다.'));

        }
        var authenticated = user.authenticate(password, user._doc.salt, user._doc.hashed_password);
        if (!authenticated) {
            console.log('비밀번호 일치하지 않음');
            return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않음'));
        }
        console.log('계정과 비밀번호가 일치');
        return done(null, user);
    });
}));

passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    var paramName = req.body.name || req.query.name;
    console.log('passport local-signup 호출 : ' + email + ", " + password + ", " + paramName);

    process.nextTick(function () {
        var database = app.get('database');
        database.UserModel.findOne({'email': email}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (user) {
                console.log('기존 계정이 있음');
                return done(null, false, req.flash('signupMessage', '계정이 이미 존재'));
            } else {
                var user = new database.UserModel({'email': email, 'password': password, 'name': paramName});

                user.save(function (err) {
                    if (err) {
                        throw  err;
                    }
                    console.log("사용자 데이터 추가함");
                    return done(null, user);
                });
            }
        });
    });
}));
passport.serializeUser(function (user,done){
    console.log('serializeUser()호출됨.');
    console.dir(user);
    done(null,user);
});
passport.deserializeUser(function (user,done){
    console.log('deserializeUser()호출');
    console.dir(user);
    done(null,user);
});

var router = express.Router();

var route_loader = require('./routes/route_loader');
route_loader.init(app,router);
router.route('/').get(function(req, res) {
    console.log('/ 패스 요청됨.');
    res.render('index.ejs');
});

// 로그인 화면 - login.ejs 템플릿을 이용해 로그인 화면이 보이도록 함
router.route('/login').get(function(req, res) {
    console.log('/login 패스 요청됨.');
    res.render('login.ejs', {message: req.flash('loginMessage')});
});

// 사용자 인증 - POST로 요청받으면 패스포트를 이용해 인증함
// 성공 시 /profile로 리다이렉트, 실패 시 /login으로 리다이렉트함
// 인증 실패 시 검증 콜백에서 설정한 플래시 메시지가 응답 페이지에 전달되도록 함
router.route('/login').post(passport.authenticate('local-login', {
    successRedirect : '/profile',
    failureRedirect : '/login',
    failureFlash : true
}));

// 회원가입 화면 - signup.ejs 템플릿을 이용해 회원가입 화면이 보이도록 함
router.route('/signup').get(function(req, res) {
    console.log('/signup 패스 요청됨.');
    res.render('signup.ejs', {message: req.flash('signupMessage')});
});

// 회원가입 - POST로 요청받으면 패스포트를 이용해 회원가입 유도함
// 인증 확인 후, 성공 시 /profile 리다이렉트, 실패 시 /signup으로 리다이렉트함
// 인증 실패 시 검증 콜백에서 설정한 플래시 메시지가 응답 페이지에 전달되도록 함
router.route('/signup').post(passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : '/signup',
    failureFlash : true
}));

// 프로필 화면 - 로그인 여부를 확인할 수 있도록 먼저 isLoggedIn 미들웨어 실행
router.route('/profile').get(function(req, res) {
    console.log('/profile 패스 요청됨.');

    // 인증된 경우, req.user 객체에 사용자 정보 있으며, 인증안된 경우 req.user는 false값임
    console.log('req.user 객체의 값');
    console.dir(req.user);

    // 인증 안된 경우
    if (!req.user) {
        console.log('사용자 인증 안된 상태임.');
        res.redirect('/');
        return;
    }

    // 인증된 경우
    console.log('사용자 인증된 상태임.');
    if (Array.isArray(req.user)) {
        res.render('profile.ejs', {user: req.user[0]._doc});
    } else {
        res.render('profile.ejs', {user: req.user});
    }
});

// 로그아웃 - 로그아웃 요청 시 req.logout() 호출함
router.route('/logout').get(function(req, res) {
    console.log('/logout 패스 요청됨.');

    req.logout();
    res.redirect('/');
});


var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('서버 시작 포트 : ' + app.get('port'));

    database.init(app, config);
});



