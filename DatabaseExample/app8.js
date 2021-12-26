var express = require('express')
    , http = require('http')
    , path = require('path');

var bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , static = require('serve-static')
    , errorHandler = require('errorhandler');

var expressErrorHandler = require('express-error-handler');

var expressSession = require('express-session');

var mysql = require('mysql');

var pool      =    mysql.createPool({
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'hello',
    password : '12345',
    database : 'test',
    debug    :  false
});

var app = express();

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use('/public', static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

var router = express.Router();

router.route('/process/login').post(function(req, res) {
    console.log('/process/login 호출됨.');
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);

    if (pool) {
        authUser(paramId, paramPassword, function(err, rows) {
            if (err) {
                console.error('사용자 로그인 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 로그인 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }
            if (rows) {
                console.dir(rows);
                var username = rows[0].name;

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 성공</h1>');
                res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
                res.write('<div><p>사용자 이름 : ' + username + '</p></div>');
                res.write("<br><br><a href='/public/login2.html'>다시 로그인하기</a>");
                res.end();

            } else {
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인  실패</h1>');
                res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
                res.write("<br><br><a href='/public/login2.html'>다시 로그인하기</a>");
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
        res.end();
    }

});

router.route('/process/adduser').post(function(req, res) {
    console.log('/process/adduser 호출됨.');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;
    var paramAge = req.body.age || req.query.age;

    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramName + ', ' + paramAge);

    if (pool) {
        addUser(paramId, paramName, paramAge, paramPassword, function(err, addedUser) {
            if (err) {
                console.error('사용자 추가 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }
            if (addedUser) {
                console.dir(addedUser);
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 성공</h2>');
                res.end();
            } else {
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가  실패</h2>');
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }

});

app.use('/', router);

var authUser = function(id, password, callback) {
    console.log('authUser 호출됨 : ' + id + ', ' + password);

    pool.getConnection(function(err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }
            callback(err, null);
            return;
        }
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

        var columns = ['id', 'name', 'age'];
        var tablename = 'users';

        var exec = conn.query("select ?? from ?? where id = ? and password = ?", [columns, tablename, id, password], function(err, rows) {
            conn.release();
            console.log('실행 대상 SQL : ' + exec.sql);

            if (rows.length > 0) {
                console.log('아이디 [%s], 패스워드 [%s] 가 일치하는 사용자 찾음.', id, password);
                callback(null, rows);
            } else {
                console.log("일치하는 사용자를 찾지 못함.");
                callback(null, null);
            }
        });

        conn.on('error', function(err) {
            console.log('데이터베이스 연결 시 에러 발생함.');
            console.dir(err);

            callback(err, null);
        });
    });

}

var addUser = function(id, name, age, password, callback) {
    console.log('addUser 호출됨 : ' + id + ', ' + password + ', ' + name + ', ' + age);

    pool.getConnection(function(err, conn) {
        if (err) {
            if (conn) {
                conn.release();
            }

            callback(err, null);
            return;
        }
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);

        var data = {id:id, name:name, age:age, password:password};

        var exec = conn.query('insert into users set ?', data, function(err, result) {
            conn.release();
            console.log('실행 대상 SQL : ' + exec.sql);

            if (err) {
                console.log('SQL 실행 시 에러 발생함.');
                console.dir(err);

                callback(err, null);

                return;
            }

            callback(null, result);

        });

        conn.on('error', function(err) {
            console.log('데이터베이스 연결 시 에러 발생함.');
            console.dir(err);

            callback(err, null);
        });
    });

}

var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );

process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
});

app.on('close', function () {
    console.log("Express 서버 객체가 종료됩니다.");
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
});
 