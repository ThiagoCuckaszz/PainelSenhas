var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const {gerarFicha, atender} = require('./fichasService');

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
  gerarFicha("Exames Nao Laboratoriais", res);
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
  atender("Exames Nao Laboratoriais", res);
});

router.get('/ultimas-fichas-por-tipo', function (req, res, next) {
  const tipos = ['Consulta', 'Preventivo', 'Exames Laboratoriais', 'Exames Nao Laboratoriais'];
  const ultimasFichas = {};
  const dataAtual = new Date().toLocaleDateString();

  tipos.forEach(tipo => {
    db.all(
      'SELECT tipo, numero FROM fichas WHERE atendido = "1" AND tipo = ? AND data = ? ORDER BY numero DESC LIMIT 1',
      [tipo, dataAtual],
      function (err, result) {
        if (err) {
          console.error(err);
          return res.status(500).send('Erro ao consultar o banco de dados');
        }

        ultimasFichas[tipo] = result;
        
        // Verifica se já obteve as últimas fichas para todos os tipos
        if (Object.keys(ultimasFichas).length === tipos.length) {
          res.json({ ultimasFichas });
        }
      }
    );
  });
});


router.get('/ficha-em-andamento', function (req, res, next) {
  const dataAtual = new Date().toLocaleDateString();
  db.all('SELECT tipo, MIN(numero) as lastFicha FROM fichas WHERE atendido = "0" and data = ? GROUP BY tipo',[dataAtual], function (err, fichasEmAndamento) {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao consultar o banco de dados');
    }

    res.json({ fichasEmAndamento });
  });
});

module.exports = router;