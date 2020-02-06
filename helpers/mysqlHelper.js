const mysql = require('mysql');
const promise = require('promise');
const appConf = require('../config/production.conf');
const winston = require('../common/logger');
const logger = winston.logger;

// mysql connection
function getConnection(){
    var conn = mysql.createConnection({
        host: appConf.MYSQL_host,
        port: appConf.MYSQL_port,
        user: appConf.MYSQL_user,
        password: appConf.MYSQL_password,
        database: appConf.MYSQL_database
    });
    return new promise(function(resolve, reject){
        conn.connect(function(err) {
            if ( err ) {
                logger.error( "mysql connect failed" );
                reject( err );
            } else {
                logger.debug( "mysql connected" );
                resolve( conn );
            }
        })
    });
}


function query(conn, qstr , cb){
    console.log( "Query String: " + qstr );
    return new promise( (resolve, reject) => {
        conn.query( qstr, (err, result) => {
            if ( err ){ 
                logger.error("sql query error: " + err);
                reject( err );
            }
            else {
                resolve( result );
            }
        });
    });
}

module.exports = {
    getConnection,
    query
}