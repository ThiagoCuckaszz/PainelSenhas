var express = require('express');
var router = express.Router();
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('fichas.db');
db.serialize(function () {
  db.run('CREATE TABLE IF NOT EXISTS fichas (id INTEGER PRIMARY KEY AUTOINCREMENT, tipo TEXT, numero INT, hora DATETIME)');
});

// Utilize um objeto para rastrear o número de ficha por tipo
let numeroFichas = {
  Consulta: 0,
  Preventivo: 0,
  "Exames Laboratoriais": 0,
  "Exames Não Laboratoriais": 0,
};

let dataUltimaFicha = new Date().toLocaleDateString();

// Função para obter a última ficha impressa do banco de dados
function obterUltimaFichaImprimida() {
  db.all('SELECT tipo, MAX(numero) as lastFicha FROM fichas GROUP BY tipo', function (err, rows) {
    if (!err && rows) {
      rows.forEach((row) => {
        if (row.tipo && row.lastFicha) {
          numeroFichas[row.tipo] = row.lastFicha;
        }
      });
    }
  });
}

// Chame a função para obter a última ficha impressa ao inicializar o aplicativo
obterUltimaFichaImprimida();

function gerarFicha(tipoFicha, res) {
  const dataAtual = new Date().toLocaleDateString();

  if (dataAtual !== dataUltimaFicha) {
    // A data mudou desde a última ficha
    dataUltimaFicha = dataAtual; // Atualize a data da última ficha
    obterUltimaFichaImprimida(); // Recarregue o número de fichas a partir do banco de dados
  } else {
    // Ainda é o mesmo dia, apenas incremente o número da ficha
    numeroFichas[tipoFicha]++;
  }

  const ficha = `${numeroFichas[tipoFicha].toString().padStart(3, '0')}`;

  // Configura a impressora
  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'tcp://192.168.10.31'
  });

  // Restante do código de configuração da impressora e impressão
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

// Rota para gerar fichas de consulta
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
