var express = require('express');
var router = express.Router();
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const sqlite3 = require('sqlite3').verbose();

const dataHoraAtual = new Date();
const dataHoraFormatada = dataHoraAtual.toLocaleString();

let numeroFicha = 0;

const db = new sqlite3.Database('fichas.db');

db.serialize(function () {
  db.run('CREATE TABLE IF NOT EXISTS fichas (id INTEGER PRIMARY KEY AUTOINCREMENT, tipo TEXT, numero INT)');
});

function gerarFicha(tipoFicha, res) {
  db.get('SELECT MAX(numero) AS max_numero FROM fichas WHERE tipo = ?', tipoFicha, function (err, row) {
    if (err) {
      res.status(500).send('Erro ao consultar a próxima ficha: ' + err.message);
      return;
    }

    if (row && row.max_numero !== null) {
      numeroFicha = row.max_numero + 1;
    } else {
      numeroFicha = 1;
    }

    const ficha = `${tipoFicha.substr(0, 1)}${numeroFicha}`;

    // Configura a impressora
    let printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: 'tcp://192.168.10.31'
    });

    // Imprime a ficha atual
    printer.alignCenter();
    printer.setTextSize(1, 1);
    printer.println("Fichas");
    printer.newLine();
    printer.println('-------------------');
    printer.println(tipoFicha);
    printer.underlineThick(false);
    printer.newLine();
    printer.println(`${ficha}`);
    printer.newLine();
    printer.setTextSize(0, 0);
    printer.println(dataHoraFormatada);
    printer.cut();

    try {
      printer.execute();
      console.log("Impressão concluída!");
      res.send(`Impressão concluída para a ficha de ${tipoFicha} ${ficha}`);
      db.run('INSERT INTO fichas (tipo, numero) VALUES (?, ?)', tipoFicha, numeroFicha);
    } catch (error) {
      console.error("Falha na impressão:", error);
      res.status(500).send("Falha na impressão: " + error.message);
    }
  });
}

// Rota para gerar fichas de consulta
router.post('/gerar-ficha-consulta', function (req, res, next) {
  gerarFicha("Consulta", res);
});

router.post('/gerar-ficha-preventivo', function (req, res, next) {
  gerarFicha("Preventivo", res);
});

router.post('/gerar-ficha-exames-laboratoriais', function (req, res, next) {
  gerarFicha("Exames Laboratoriais", res);
});

router.post('/gerar-ficha-exames-nao-laboratoriais', function (req, res, next) {
  gerarFicha("Exames Não Laboratoriais", res);
});

module.exports = router;
