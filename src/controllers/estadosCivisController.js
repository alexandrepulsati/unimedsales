const oracledb = require("oracledb");
const dbConfig  = require('./../dbconfig.js');
async function run(req, res, next) {
    let connection;
    try {
      let sql, binds, options, result;
      connection = await oracledb.getConnection(dbConfig);
      sql = `select VL_DOMINIO CODIGO,DS_VALOR_DOMINIO DESCRICAO from tasy.VALOR_DOMINIO_V WHERE CD_DOMINIO=5 AND IE_SITUACAO='A'`;
      binds = {};
      options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT,   // query result format
        // extendedMetaData: true,               // get extra metadata
      };  
      result = await connection.execute(sql, binds, options);        
      res.send(result.rows);
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
          try {
            await connection.close();
          } catch (err) {
            console.error(err);
          }
        }
    }  
}

exports.get = (req, res, next) => {
       run(req, res, next);
};
