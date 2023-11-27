var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const {obterUltimaFichaImprimida, gerarFicha, atender} = require('./fichasService');

const db = new sqlite3.Database('fichas.db');

router.post('/consulta', function (req, res, next) {
  gerarFicha("Consulta", res);
});

router.post('/preventivo', function (req, res, next) {
  gerarFicha("Preventivo", res);
});

router.post('/exames-laboratoriais', function (req, res, next) {
  gerarFicha("Exames Laboratoriais", res);
});

router.post('/exames-nao-laboratoriais', function (req, res, next) {
  gerarFicha("Exames Não Laboratoriais", res);
});


router.post('/atender_consulta', function (req, res, next) {
  atender("Consulta", res);
});

router.post('/atender_preventivo', function (req, res, next) {
  atender("Preventivo", res);
});

router.post('/atender_exames-laboratoriais', function (req, res, next) {
  atender("Exames Laboratoriais", res);
});

router.post('/atender_exames-nao-laboratoriais', function (req, res, next) {
  atender("Exames Não Laboratoriais", res);
});

router.get('/ficha-em-andamento', function (req, res, next) {

  db.all('SELECT tipo, MIN(numero) as lastFicha FROM fichas WHERE atendido = "0" GROUP BY tipo', function (err, fichasEmAndamento) {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao consultar o banco de dados');
    }

    res.json({ fichasEmAndamento });
  });
});

module.exports = router;