var mysql = require('mysql');
var config = require('./db_config');

var dbconnection = {
	init : function(){
			return mysql.createConnection(config);	//로컬개발환경
	},

	dbopen : function(con){
		con.connect(function(err){
      if(err){
        console.log(err);
        setTimeout(dbconnection.dbopen, 2000);
      }else{
				console.info("mysql connection successfully.");
			}
		});
    con.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        dbconnection.dbopen;                         // lost due to either server restart, or a
      } else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
      }
    });
	}
};


module.exports = dbconnection;
                                // process asynchronous requests in the meantime.
                                        // If you're also serving http, display a 503 error.
