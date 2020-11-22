var mysql = require('mysql');
/* Creating POOL MySQL connection.*/

var dbpoolcon    =    mysql.createPool({
      connectionLimit   :   100,
      host              :   'localhost',
      user              :   'root',
      password          :   'eg39315',
      database          :   'management',
      debug             :   false,
      multipleStatements:   true
});


module.exports = dbpoolcon;
