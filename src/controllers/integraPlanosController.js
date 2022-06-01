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
  const data = await sqlDataSales(
    conn,
    "SELECT Id FROM RecordType WHERE SobjectType = 'Product2' AND DeveloperName = 'Unimed_Natal_Pessoa_Fisica'",
  );
  recordtypeid=data.records[0].Id;
  let connection;
    try {
      let sql, binds, options, result;
      connection = await oracledb.getConnection(dbConfig);
      sql = `SELECT VW_LISTA_PLANOS.*,'` + recordtypeid + `' RECORDTYPEID FROM VW_LISTA_PLANOS`;
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
