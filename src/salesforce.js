var express = require( 'express' ); //Adding Express
var http = require( 'http' ); //Adding http
var jsforce = require('jsforce'); //Adding JsForce
var app = express();
app.set( 'port', process.env.PORT || 3001 );
app.get('/', function (req, res) {
var conn = new jsforce.Connection({
// you can change loginUrl to connect to sandbox or prerelease env.
  loginUrl : 'https://test.salesforce.com'
});
var username = 'contas.dev@unimednatal.com.br.dev';
var password = '@Un1m3dN4t4l#4FuzyaupLsNZGnkuvvnZvYNgT';
conn.login(username, password, function(err, userInfo) {
if (err) { return console.error(err); }
// Now you can get the access token and instance URL information.
// Save them to establish a connection next time. 
console.log(conn.accessToken);
console.log(conn.instanceUrl);
// logged in user property
console.log("User ID: " + userInfo.id);
console.log("Org ID: " + userInfo.organizationId);

var records = []; 

conn.query("SELECT Id FROM RecordType WHERE SobjectType = 'Product2' AND DeveloperName = 'Unimed_Natal_Pessoa_Fisica'", function(err, result) { 
    res.send(result.records[0].Id);

console.log("total : " + result.totalSize); 

console.log("fetched : " + result.records.length); 

}); 


});
});
http.createServer( app ).listen( app.get( 'port' ), function (){
console.log( 'Express server listening on port ' + app.get( 'port' ));
});