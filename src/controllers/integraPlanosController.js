const oracledb = require("oracledb");
var http = require( 'http' ); //Adding http
var jsforce = require('jsforce'); //Adding JsForce
const dbConfig  = require('./../dbconfig.js');
const SEC_TOKEN = "4FuzyaupLsNZGnkuvvnZvYNgT";
const USER_ID = "contas.dev@unimednatal.com.br.dev";
const PASSWORD = "@Un1m3dN4t4l#";
let recordtypeid;

async function run(req, res, next) {
  const { conn, userInfo } = await initConnectSales();
 
 /* const data2 = await sqlDataSales(
    conn,
    "SELECT Id,Name FROM Product2 WHERE Id='01t7i000008jl29AAA'",
  );
  console.log(data2.records);

  const data3 = await sqlDataSales(
    conn,
    "SELECT Produto__c,Faixa_Etaria__c,Valor__c,Vigencia__c FROM Configuracao_de_tabela_de_preco__c WHERE Produto__c='01t7i000008jl29AAA'",
  );
  console.log(data3.records);
  return */

  const data = await sqlDataSales(
    conn,
    "SELECT Id FROM RecordType WHERE SobjectType = 'Product2' AND DeveloperName = 'Unimed_Natal_Pessoa_Fisica'",
  );
  recordtypeid=data.records[0].Id;

    let connection;
    let vup=[];

    try {
      let sql, binds, options, result;
      connection = await oracledb.getConnection(dbConfig);
      sql = `SELECT VW_LISTA_PLANOS.*,'` + recordtypeid + `' RECORDTYPEID FROM VW_LISTA_PLANOS 
      UNION ALL SELECT VW_LISTA_PLANOS_INATIVOS.*,'` + recordtypeid + `' RECORDTYPEID FROM VW_LISTA_PLANOS_INATIVOS`;
      binds = {};
      options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT,   // query result format
        // extendedMetaData: true,               // get extra metadata
      };  

      result = await connection.execute(sql, binds, options);  

      await conn.sobject("Product2").upsert(result.rows,
       'ID_EXTERNAL__C',
       { allOrNone: true },
       function(err, rets) {
         if (err) { return console.log(err); }
      
         for (var i=0; i < rets.length; i++) {
           if (rets[i].success) { 
            if ( rets[i].id){
              vup.push([ rets[i].id.toString(), result.rows[i].ID_EXTERNAL__C.toString()]);
            } else {
              vup.push([ null, result.rows[i].ID_EXTERNAL__C.toString()]);
            }
           }
         }
         if (vup.length>0){
            var options = {
              autoCommit: true,   // autocommit if there are no batch errors
              batchErrors: true,  // identify invalid records; start a transaction for valid ones
              bindDefs: [         // describes the data in 'binds'
                { type: oracledb.STRING, maxSize: 25 },
                { type: oracledb.STRING, maxSize: 25 }
              ]
            };
           
            var sql= "update INTEGRACAO_ECOMMERCE set ID_SALESFORCE= :id_sales_p, STATUS=1,DATAHORA=SYSDATE WHERE ID_TASY= :id_tasy_p and STATUS=0 ";
            connection.executeMany(sql, vup, options, function (err, result) {
              if (err)
                console.error(err);
              else {
                //console.log("Result is:", result);
              }
            });
          }

       });

       sql = `SELECT  VW_LISTA_PLANOS_PRECOS.NR_SEQUENCIA,VW_LISTA_PLANOS_PRECOS.PRODUTO__C  FROM VW_LISTA_PLANOS_PRECOS GROUP BY NR_SEQUENCIA,VW_LISTA_PLANOS_PRECOS.PRODUTO__C  ORDER BY NR_SEQUENCIA,VW_LISTA_PLANOS_PRECOS.PRODUTO__C`;
       binds = {};
       options = {
         outFormat: oracledb.OUT_FORMAT_OBJECT,   // query result format
         // extendedMetaData: true,               // get extra metadata
       };  

      
       result = await connection.execute(sql, binds, options);  
       let linha=result.rows;
       let idsales;
       let idtasy;
       vup=[];
       for (var i=0; i < linha.length; i++) {
            idsales=linha[i]['PRODUTO__C'];
            idtasy=linha[i]['NR_SEQUENCIA'];
            vup.push([ idtasy.toString()]);
           await conn.sobject('Configuracao_de_tabela_de_preco__c')
           .find({ Produto__c : idsales })
           .destroy(function(err, rets) {
             if (err) { return console.error(err); }
             //console.log(rets);
             // ...
           });

       }

       sql = `SELECT FAIXA_ETARIA__C,INICIO_FAIXA_ETARIA__C,FIM_FAIXA_ETARIA__C,VALOR__C,PRODUTO__C,VIGENCIA__C FROM VW_LISTA_PLANOS_PRECOS`;
       binds = {};
       options = {
         outFormat: oracledb.OUT_FORMAT_OBJECT
       };  
       result = await connection.execute(sql, binds, options);
       conn.sobject("Configuracao_de_tabela_de_preco__c").create(result.rows,
      function(err, rets) {
        if (err) { return console.error(err); }
       
        for (var i=0; i < rets.length; i++) {
          if (rets[i].success) {
           // console.log("Created record id : " + rets[i].id);
          }
        }
        // ...
      });
      

      if(vup.length>0){
          options = {
            autoCommit: true,   // autocommit if there are no batch errors
            batchErrors: true,  // identify invalid records; start a transaction for valid ones
            bindDefs: [         // describes the data in 'binds'
              { type: oracledb.STRING, maxSize: 25 }
            ]
          };
        
          sql= "update INTEGRACAO_ECOMMERCE set  STATUS=2 WHERE ID_TASY= :id_tasy_p and STATUS=1";
          connection.executeMany(sql, vup, options, function (err, result) {
            if (err)
              console.error(err);
            else {
              //console.log("Result is:", result);
            }
          });
     }

     let ret = {
      "resultado" : true,
      "mensagem": "registros integrados com sucesso.",
    }   
    res.send(ret);  

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

function initConnectSales() {
  const conn = new jsforce.Connection({
    loginUrl: "https://test.salesforce.com",
  });
  return new Promise((resolve, reject) => {
    conn.login(USER_ID, PASSWORD + SEC_TOKEN, (err, userInfo) => {
      if (err) return reject(err);
      resolve({ conn, userInfo });
    });
  });
}

function sqlDataSales(conn, query) {
  return new Promise((resolve, reject) => {
    conn.query(query, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

exports.get = (req, res, next) => {
  run(req, res, next);
};
