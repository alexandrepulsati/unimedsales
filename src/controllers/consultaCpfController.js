const oracledb = require("oracledb");
const dbConfig  = require('./../dbconfig.js');
async function run(req, res, next) {
    let connection;
    try {
      let sql, binds, options, result;
      connection = await oracledb.getConnection(dbConfig);
      cpf = req.body.cpf;
      sql = `SELECT * FROM TABLE(FN_CONSULTA_CPF(` + cpf + `))`;
      binds = {};
      options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT,   // query result format
        // extendedMetaData: true,               // get extra metadata
      };  
      result = await connection.execute(sql, binds, options);     
      if(result.rows.length > 0){
        let ret = {
          "resultado" : true,
          "dados": result.rows[0],
        }   
        res.send(ret);  
      } else {
        let ret = {
          "resultado" : false,
          "obs": "registro não encontrado"
        } 
        res.send(ret);    
      }
    } catch (err) {
      res.send(err);
    } finally {
        if (connection) {
          try {
            await connection.close();
          } catch (err) {
            res.send(err);
          }
        }
    }  
}

exports.post = (req, res, next) => {
  run(req, res, next);
};
