const oracledb = require("oracledb");
const dbConfig  = require('./../dbconfig.js');
async function run(req, res, next) {
    let connection;
    try {
      let sql, binds, options, result;
      connection = await oracledb.getConnection(dbConfig);
      sql = `SELECT * FROM VW_LISTA_PARENTESCOS`;
      binds = {};
      options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT,   // query result format
        // extendedMetaData: true,               // get extra metadata
      };  
      result = await connection.execute(sql, binds, options);        
      res.send(result.rows);
    } catch (err) {
      res.send('ERRO SELECT');
        console.error(err);
    } finally {
        if (connection) {
          try {
            await connection.close();
          } catch (err) {
            console.error(err);
            res.send(err);
          }
        }
    }  
}

exports.get = (req, res, next) => {
       run(req, res, next);
};