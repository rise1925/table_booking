/**
* Module dependencies.
*/
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');
//var methodOverride = require('method-override');
var session = require('express-session');
var app = express();
var mysql      = require('mysql');
var bodyParser=require("body-parser");
var dbConObj = require('./routes/db/db_info'); //사용자 정의한 함수 사용

var db = dbConObj.init();
var pool = require('./routes/db/db_pool');
var no = 0;
var table1_zero = 0;
var table1_one = 0;
var table2_zero = 0;
var table2_one = 0;
var d1 = 0,d2 = 0,d3 = 0,d4 = 0,d5 = 0,d6 = 0;
var error_value = false;
var SerialPort = require('serialport');
    serial = new SerialPort('COM4', {
    baudRate : 115200
  }) ;
  serial.on('data', function(data) {

    d1 = parseInt(String.fromCharCode(data[0]));
    d2 = parseInt(String.fromCharCode(data[1]));
    d3 = parseInt(String.fromCharCode(data[2]));
    d4 = parseInt(String.fromCharCode(data[3]));
    d5 = parseInt(String.fromCharCode(data[4]));
    d6 = parseInt(String.fromCharCode(data[5]));
    console.log("-------------------------------");
    
    console.log(d1 + ", " + d2+ ", " + d3+ ", " + d4+ ", " + d5+ ", " + d6);
    if(!Number.isNaN(d1) && !Number.isNaN(d2) && !Number.isNaN(d3) && !Number.isNaN(d4)){         // 가끔 NaN 값을 필터링 하기 위함
      if(d1 == 0 && d2 == 0 && d3 == 0 && d4 == 0){                                               // 테이블 #1 모두 자리를 비웠을 때 카운트 시작
        table1_zero++;
      }else if(d1 == 1 || d2 == 1 || d3 == 1 || d4 == 1){                                         // 테이블 #1 에서 1명이라도 자리에 돌아오면 카운트 초기화
        table1_one++;
        if(table1_one > 10){                                                                      // 초기화 할때 오차를 생각하여 연속으로 10번이상 오면 초기화
          table1_zero = 0;
          table1_one = 0;
        }
      }      
    }

    if(!Number.isNaN(d5) && !Number.isNaN(d6)){                                                    // 가끔 NaN 값을 필터링 하기 위함
      if(d5 == 0 && d6 == 0 ){                                                                     // 테이블 #2 모두 자리를 비웠을 때 카운트 시작
        table2_zero++;
      }else if(d5 == 1 || d6 == 1){                                                                // 테이블 #2 에서 1명이라도 자리에 돌아오면 카운트 초기화
        table2_one++;
        if(table2_one > 10){                                                                       // 초기화 할때 오차를 생각하여 연속으로 10번이상 오면 초기화
          table2_zero = 0;
          table2_one = 0;
        }
      }      
    }
    console.log("no : " + no++ + "    ,    table #1 zero: " + table1_zero + "    ,    table #2 zero: " + table2_zero )
    console.log("no : " + no++ + "    ,    table #1 one: " + table1_one + "    ,    table #2 one: " + table2_one )
    if(table1_zero > (60 * 5)){                                                                     // 60 * 5 = 5분이상 모두 자리에 없으면 이벤트 발생
      table1_zero = 0;
    }
    if(table2_zero > (60 * 5)){                                                                     // 60 * 5 = 5분이상 모두 자리에 없으면 이벤트 발생
      table2_zero = 0;
    }
    error_value = false;
    
  }) ;
  serial.on('error', function(data) {
    error_value = true;
  });
  app.post('/realtime_seat', function (req, res) {
        return res.json(200,{status:"ok",  error_val : error_value, d1 : d1, d2:d2, d3:d3, d4:d4, d5:d5, d6:d6, table1_zero :  table1_zero, table2_zero :  table2_zero, table1_one :  table1_one,table2_one :  table2_one});
  });
// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');63
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
              secret: 'keyboard cat',
              resave: false,
              saveUninitialized: true,
              cookie: { maxAge: 60000 }
            }))
 
// development only
app.post('/admin_delete', user.admin_delete);
app.post('/booking_cancel', user.booking_cancel);
app.post('/booking_show', user.booking_show);
app.post('/booking_data', user.booking_data);
app.get('/', routes.index);//call for main index page
app.get('/signup', user.signup);//call for signup page
app.post('/signup', user.signup);//call for signup post 
app.get('/login', routes.index);//call for login page
app.post('/login', user.login);//call for login post
app.get('/home/dashboard', user.dashboard);//call for dashboard page after login
app.get('/home/logout', user.logout);//call for logout
app.get('/home/profile',user.profile);//to render users profile
//Middleware
app.listen(8080);