const oracledb = require("oracledb");
const dbConfig  = require('../dbconfig.js');
async function run(req, res, next) {
    let connection;
    try {
      let sql, binds, options, result;
      connection = await oracledb.getConnection(dbConfig);
      const cep = req.body.cep;
      sql = `SELECT 
              CD_CEP AS CEP, 
              '' AS CD_LOGRADOURO,  
              DS_UF AS UF,
              DS_TIPO_LOGRADOURO AS TIPO_LOGRADOURO,
              NM_LOGRADOURO AS LOGRADOURO,
              DS_BAIRRO AS BAIRRO,
              NM_LOCALIDADE AS CIDADE
              FROM TASY.CEP_LOGRADOURO_V WHERE CD_CEP = '` + cep + `'`;
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
        sql = `SELECT 
                CD_CEP AS CEP,
                '' AS CD_LOGRADOURO,
                DS_UF AS UF,
                '' AS TIPO_LOGRADOURO,
                '' AS LOGRADOURO,
                '' AS BAIRRO,
                NM_LOCALIDADE AS CIDADE
                FROM TASY.cep_loc WHERE CD_CEP= '` + cep + `'`;
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
    }
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

exports.post = (req, res, next) => {
  run(req, res, next);
};
