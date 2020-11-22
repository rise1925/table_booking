var async = require('async');
var pool = require("./db/db_pool");
//---------------------------------------------signup page call------------------------------------------------------
exports.signup = function(req, res){
   message = '';
   if(req.method == "POST"){
      var post  = req.body;
      var name= post.user_name;
      var pass= post.password;
      var fname= post.first_name;
      var lname= post.address;
      var mob= post.mob_no;

      var sql = "INSERT INTO `users`(`first_name`,`address`,`mob_no`,`user_name`, `password`) VALUES ('" + fname + "','" + lname + "','" + mob + "','" + name + "','" + pass + "')";
      pool.getConnection(function(err, con) {
         if (err) {
             console.log(err)
             con.release();    
         }else{
             //console.log("Connected!");
             con.query(sql, function (err, result) {
                 console.log(JSON.stringify(result));
                 message = "Succesfully! Your account has been created.";
                  res.render('signup.ejs',{message: message});
             });   
             con.release();         
         }        
       }); 

   } else {
      res.render('signup');
   }
};
 
//-----------------------------------------------login page call------------------------------------------------------
exports.login = function(req, res){
   var message = '';
   var sess = req.session; 

   if(req.method == "POST"){
      var post  = req.body;
      var name= post.user_name;
      var pass= post.password;
     
      var sql="SELECT id, first_name, address, mob_no, user_name FROM `users` WHERE `user_name`='"+name+"' and password = '"+pass+"'";                           
      pool.getConnection(function(err, con) {
         if (err) {
             console.log(err)
             con.release();    
         }else{
             //console.log("Connected!");
             con.query(sql, function (err, results) {
               if(results.length){
                  req.session.userId = results[0].id;
                  req.session.first_name = results[0].first_name;
                  req.session.mob_no = results[0].mob_no;
                  req.session.user = results[0];
                  console.log(results[0].id);
                  res.redirect('/home/dashboard');
               }
               else{
                  message = 'Wrong Credentials.';
                  res.render('index.ejs',{message: message});
               }
             });   
             con.release();         
         }        
       }); 
      
   } else {
      res.render('index.ejs',{message: message});
   }
           
};
//-----------------------------------------------dashboard page functionality----------------------------------------------
           
exports.dashboard = function(req, res, next){
           
   var user =  req.session.user,
   userId = req.session.userId;
   console.log('ddd='+userId);
   if(userId == null){
      res.redirect("/login");
      return;
   }

    
   var sql="SELECT no, name, phone_num, people_count, DATE_FORMAT(booking_time, '%Y-%m-%d %H:%i:%s')booking_time FROM management.booking_list";
   var sql1="SELECT id, first_name, address, mob_no, user_name FROM `users` WHERE `id`="+userId; 
   // 로그인시 이미 예약이 되어있는지를 판단하여 예약 되어있으면, 취소하기 버튼 생성, 예약 안되어있으면 예약하기버튼 생성
   // 로그인시에 해당하는 users 테이블에 id 를 추출하여 first_name, booking_list 의 name 을 비교하고 users 의 mob_no 과 booking_list 의 phone_number 를 비교하여 중복되는 값이 있으면 1, 없으면 0으로 표기
   var sql2="select case when count(*) = 0 then 0 else 1 end AS dup_cnt from booking_list, users where users.id = '"+userId+"' and users.first_name = booking_list.name and users.mob_no = booking_list.phone_num;"
    pool.getConnection(function(err, con) {
      if (err) {
          console.log(err)
          con.release();    
      }else{
          //console.log("Connected!");
          async.parallel([
            function(callback) { con.query(sql, callback) },
            function(callback) { con.query(sql1, callback) },
            function(callback) { con.query(sql2, callback) }  
          ], function(err, results) {
            //console.log("sql2 : " + sql2);
            if (err) {
              console.log(err);
              logger.info(err);
            }
            //console.log(results[1][0])
            //res.render('realtime_data.ejs', {menu : results[0][0], s_unit : results[1][0], username:req.signedCookies.name,user_permission:req.signedCookies.permission});
            res.render('dashboard.ejs', {data1:results[0][0], data2:results[1][0], data3:results[2][0]});
              
        });  
          con.release();         
      }        
    }); 

};
//------------------------------------logout functionality----------------------------------------------
exports.logout=function(req,res){
   req.session.destroy(function(err) {
      res.redirect("/login");
   })
};
//--------------------------------render user details after login--------------------------------
exports.profile = function(req, res){

   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";     
   pool.getConnection(function(err, con) {
      if (err) {
          console.log(err)
          con.release();    
      }else{
          console.log("Connected!");
          con.query(sql, function (err, result) {
            res.render('profile.ejs',{data:result});
          });   
          con.release();         
      }        
    });    

};
//---------------------------------edit users details after login----------------------------------
exports.editprofile=function(req,res){
   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";
   pool.getConnection(function(err, con) {
      if (err) {
          console.log(err)
          con.release();    
      }else{
          console.log("Connected!");
          con.query(sql, function (err, result) {
            res.render('edit_profile.ejs',{data:results});
          });   
          con.release();         
      }        
    });    

};




exports.booking_data = function(req, res, next){
           
   var value1 = req.body.name;
  var value2 = req.body.phone_num;
  var value3 = req.body.people_count;
   //console.log("//////////// " + value1)
   var sql1 = "INSERT INTO booking_list (name,phone_num,people_count) SELECT '"+ value1 +"','"+value2+"', '"+value3+"' from dual WHERE NOT EXISTS (SELECT * FROM booking_list WHERE name = '"+value1+"' AND phone_num='"+value2+"' )"
   //var sql1="INSERT INTO `booking_list`(`name`,`phone_num`,`people_count`) VALUES ('" + value1 + "','" + value2 + "','" + value3+"')";
   pool.getConnection(function(err, con) {
      if (err) {
          console.log(err)
          con.release();    
      }else{
          console.log("Connected!");
          async.parallel([
            function(callback) { con.query(sql1, callback) }
          ], function(err, results) {
            //console.log("sql2 : " + sql2);
            if (err) {
              console.log(err);
              logger.info(err);
            }

            res.json(200,{status:"ok"});
        });  
          con.release();         
      }        
    }); 

};
exports.booking_cancel = function(req, res, next){
           
  var value1 = req.body.name;
 var value2 = req.body.phone_num;
 var value3 = req.body.people_count;
console.log("delete :  " + value1)
  var sql1 = "DELETE FROM booking_list WHERE name= '"+ value1 +"' and phone_num='"+value2+"';"

  pool.getConnection(function(err, con) {
     if (err) {
         console.log(err)
         con.release();    
     }else{
         console.log("Connected!");
         async.parallel([
           function(callback) { con.query(sql1, callback) }
         ], function(err, results) {
           console.log("sql1 : " + sql1);
           if (err) {
             console.log(err);
             logger.info(err);
           }

           res.json(200,{status:"ok"});
       });  
         con.release();         
     }        
   }); 

};
exports.admin_delete = function(req, res, next){
           
  var value1 = req.body.id_value;

console.log("delete :  " + value1);
  var sql1 = "DELETE FROM booking_list WHERE no= '"+ value1 + "'";

  pool.getConnection(function(err, con) {
     if (err) {
         console.log(err)
         con.release();    
     }else{
         //console.log("Connected!");
         async.parallel([
           function(callback) { con.query(sql1, callback) }
         ], function(err, results) {
           console.log("sql1 : " + sql1);
           if (err) {
             console.log(err);
             logger.info(err);
           }

           res.json(200,{status:"ok"});
       });  
         con.release();         
     }        
   }); 

};
exports.booking_show = function(req, res, next){
           
   var value1 = req.body.name;
  var value2 = req.body.phone_num;
  var value3 = req.body.people_count;
//console.log("//////////// " + value1)
   var sql="SELECT no, name, phone_num, people_count, DATE_FORMAT(booking_time, '%Y-%m-%d %H:%i:%s')booking_time FROM booking_list;";
   
   pool.getConnection(function(err, con) {
      if (err) {
          console.log(err)
          con.release();    
      }else{
          //console.log("Connected!");
          async.parallel([
            function(callback) { con.query(sql, callback) }
          ], function(err, results) {
            //console.log("sql2 : " + sql2);
            if (err) {
              console.log(err);
              logger.info(err);
            }

            res.json(200,{status:"ok",  data1:results[0][0]});
        });  
          con.release();         
      }        
    }); 

};