var express = require('express');
var router = express.Router();
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('fichas.db');
db.serialize(function () {
  db.run('CREATE TABLE IF NOT EXISTS fichas (id INTEGER PRIMARY KEY AUTOINCREMENT, tipo TEXT, numero INT, hora DATETIME)');
});

let numeroFichas = {
  Consulta: null,
  Preventivo: null,
  "Exames Laboratoriais": null,
  "Exames Não Laboratoriais": null,
};

let dataUltimaFicha = null;

function obterUltimaFichaImprimida() {
  const dataAtual = new Date().toLocaleDateString();

  if (dataUltimaFicha !== null && dataAtual !== dataUltimaFicha) {
    for (const tipo in numeroFichas) {
      numeroFichas[tipo] = 0;
    }
  } else {
    db.all('SELECT tipo, MAX(numero) as lastFicha FROM fichas WHERE data = ? GROUP BY tipo', [dataAtual], function (err, rows) {
      if (!err && rows) {
        rows.forEach((row) => {
          if (row.tipo && row.lastFicha) {
            numeroFichas[row.tipo] = row.lastFicha;
          }
        });
      }
    });
  }

  dataUltimaFicha = dataAtual;
}


obterUltimaFichaImprimida();


function gerarFicha(tipoFicha, res) {
  const dataAtual = new Date().toLocaleDateString();

  if (dataAtual !== dataUltimaFicha) {
    dataUltimaFicha = dataAtual;
    obterUltimaFichaImprimida();
  } else {
    numeroFichas[tipoFicha]++;
  }

  const ficha = `${numeroFichas[tipoFicha].toString().padStart(3, '0')}`;


  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'tcp://192.168.10.31'
  });


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
  const dataHoraAtual = new Date().toLocaleString();
  printer.setTextSize(0, 0);
  printer.println(dataHoraAtual);
  printer.cut();

  try {
    printer.execute();
    console.log("Impressão concluída!");
    res.send(`Impressão concluída para a ficha de ${tipoFicha} ${ficha}`);
    db.run('INSERT INTO fichas (tipo, numero, hora) VALUES (?, ?, ?)', tipoFicha, numeroFichas[tipoFicha], dataHoraAtual);
  } catch (error) {
    console.error("Falha na impressão:", error);
    res.status(500).send("Falha na impressão: " + error.message);
  }
}


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

module.exports = router;
