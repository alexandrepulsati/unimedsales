const oracledb = require("oracledb");
const dbConfig  = require('./../dbconfig.js');
async function run(req, res, next) {
    let connection;
    try {
        let sql, binds, options, result;
        connection = await oracledb.getConnection(dbConfig);
        var beneficiarios=req.body.beneficiarios;
        for (var i=0; i < beneficiarios.length; i++) {         
          beneficiarios[i]['ds_endereco']=beneficiarios[i]['endereco']['logradouro'];
          beneficiarios[i]['nr_endereco']=beneficiarios[i]['endereco']['numero'];
          beneficiarios[i]['cd_cep']=beneficiarios[i]['endereco']['cep'];
          beneficiarios[i]['ds_complemento']=beneficiarios[i]['endereco']['complemento'];
          beneficiarios[i]['ds_bairo']=beneficiarios[i]['endereco']['bairro'];
          beneficiarios[i]['ds_municipio']=beneficiarios[i]['endereco']['cidade'];
          beneficiarios[i]['ds_estado']=beneficiarios[i]['endereco']['uf'];
          beneficiarios[i]['ds_complemento']=beneficiarios[i]['endereco']['complemento'];
          var contatos=beneficiarios[i]['contatos'];
          beneficiarios[i]['ds_telefone']='';
          for (var k=0; k < contatos.length; k++) {         
              if (contatos[k]['cod_tipo_meio_contato']==1){ beneficiarios[i]['ds_celular'] = contatos[k]['numero'];   }
              if (contatos[k]['cod_tipo_meio_contato']==2){ beneficiarios[i]['ds_telefone'] = contatos[k]['numero'];   }
              if (contatos[k]['cod_tipo_meio_contato']==3){ beneficiarios[i]['ds_email'] = contatos[k]['numero'];   }
          }
         sql =   `begin 
                      PS_GRAVA_PF('` + beneficiarios[i]['cpf'] + `', 
                      '` + beneficiarios[i]['nome'] + `',
                      1,  --verificar o estado civil
                      '` + beneficiarios[i]['rg'] + `',
                      '` + beneficiarios[i]['orgao_emissor'] + `',
                      'Brasileiro',
                      '` + beneficiarios[i]['sexo'] + `',
                      '` + beneficiarios[i]['data_nascimento'] + `',
                      ` + beneficiarios[i]['peso'] + `,
                      '` + beneficiarios[i]['mae'] + `',
                      '` + beneficiarios[i]['pai'] + `',
                      '` + beneficiarios[i]['ds_celular'] + `',
                      '` + beneficiarios[i]['cns'] + `',
                      ` + beneficiarios[i]['altura'] + `,
                      '` + beneficiarios[i]['cd_cep'] + `',
                      '` + beneficiarios[i]['ds_endereco'] + `',
                      ` + beneficiarios[i]['nr_endereco'] + `,
                      '` + beneficiarios[i]['ds_complemento'] + `',
                      '` + beneficiarios[i]['ds_bairo'] + `',
                      '` + beneficiarios[i]['ds_municipio'] + `',
                      '` + beneficiarios[i]['ds_estado'] + `',
                      '` + beneficiarios[i]['ds_telefone'] + `',
                      '` + beneficiarios[i]['ds_email'] + `'
                      );
                      end;`

                      options = {
                        autoCommit: true   // autocommit if there are no batch errors
                      };
                      binds = {};
                      connection.execute(sql, binds,options, function (err, result) {
                        if (err)
                          console.error(err);
                        else {
                         // console.log( result);
                        }
                      });

                      let ret = {
                        "resultado" : true,
                        "mensagem": "contrato gerado com sucesso.",
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
