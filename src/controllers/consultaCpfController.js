const oracledb = require("oracledb");
const dbConfig  = require('./../dbconfig.js');
async function run(req, res, next) {
    let connection;
    try {
      let sql, binds, options, result;
      connection = await oracledb.getConnection(dbConfig);
      cpf = req.body.cpf;
      sql = `SELECT 
          CD_PESSOA_FISICA cod_beneficiario, 
          NM_PESSOA_FISICA nome_beneficiario,
          IE_SEXO sexo,
          DT_NASCIMENTO data_nascimento,
          (select DS_VALOR_DOMINIO DESCRICAO from tasy.VALOR_DOMINIO_V WHERE CD_DOMINIO=5 AND IE_SITUACAO='A' and VL_DOMINIO=PF.IE_ESTADO_CIVIL) estado_civil,
          NR_IDENTIDADE rg,
          NR_CPF cpf,
          (SELECT NM_CONTATO FROM TASY.COMPL_PESSOA_FISICA COMPLPF WHERE COMPLPF.CD_PESSOA_FISICA = PF.CD_PESSOA_FISICA AND IE_TIPO_COMPLEMENTO=5) nome_mae,
          SG_EMISSORA_CI cod_uf_rg,
          DS_ORGAO_EMISSOR_CI org_expedidor_rg,
          NR_CARTAO_NAC_SUS carteira_sus,
          '' genero,
          (SELECT NM_PESSOA_FISICA FROM TASY.PESSOA_FISICA PFM WHERE PFM.CD_PESSOA_FISICA=PF.CD_MEDICO) medico_cooperado,
          DS_OBSERVACAO obs
          FROM TASY.PESSOA_FISICA PF WHERE NR_CPF = '` + cpf + `'`;
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
