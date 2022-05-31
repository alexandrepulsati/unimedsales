const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false}))

//Rotas
const index = require('./routes/index');
const parentescosRoute = require('./routes/parentescosRoute');
const estadosCivisRoute = require('./routes/estadosCivisRoute');
const tiposContatosRoute = require('./routes/tiposContatosRoute');
const consultaCpfRoute = require('./routes/consultaCpfRoute');
const buscaCepRoute = require('./routes/buscaCepRoute');

app.use('/', index);
app.use('/sales', index);
app.use('/sales/parentescos', parentescosRoute);
app.use('/sales/estados_civis', estadosCivisRoute);
app.use('/sales/tipos_contatos', tiposContatosRoute);
app.use('/sales/consulta_cpf', consultaCpfRoute);
app.use('/sales/busca_cep', buscaCepRoute);

module.exports = app;