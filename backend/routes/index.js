var express = require('express');
var router = express.Router();
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const sqlite3 = require('sqlite3').verbose();

const dataHoraAtual = new Date();
const dataHoraFormatada = dataHoraAtual.toLocaleString();

function realizarTesteDeImpressora() {
  // Configura a impressora
  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'tcp://192.168.10.31'
  });


  printer.alignCenter();
  printer.setTextSize(1,1);
  printer.bold();
  printer.println('Teste');
  printer.println('-------------------')
  printer.underlineThick(true);    
  printer.println('PRIORITARIO');
  printer.underlineThick(false);    
  printer.cut();

  try {
    printer.execute();
    console.log("Teste de impressora concluído com sucesso!");
  } catch (error) {
    console.error("Falha no teste de impressora:", error);
  }
}

let numeroSenha = 0;

const db = new sqlite3.Database('senhas.db');

db.serialize(function () {
  db.run('CREATE TABLE IF NOT EXISTS senhas (id INTEGER PRIMARY KEY AUTOINCREMENT, tipo TEXT, numero INT)');
});

// Rota para imprimir senhas (pode ser a rota para senhas normais)
router.get('/gerar-senha-normal', function (req, res, next) {
  // Consulte o banco de dados para obter a próxima senha a ser impressa
  db.get('SELECT MAX(numero) AS max_numero FROM senhas WHERE tipo = "FN"', function (err, row) {
    if (err) {
      res.status(500).send('Erro ao consultar a próxima senha: ' + err.message);
      return;
    }

    if (row && row.max_numero !== null) {
      numeroSenha = row.max_numero + 1;
    } else {
      numeroSenha = 1;
    }

    const senha = `FN${numeroSenha}`; // Modelo de senha normal

    // Configura a impressora
    let printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: 'tcp://192.168.10.31'
    });

    // Imprime a senha atual (normal)
    printer.alignCenter();
    printer.setTextSize(1,1);  
    printer.println("Fichas");
    printer.newLine();             
    printer.println('-------------------')                           
    printer.println("NORMAL");
    printer.underlineThick(false);   
    printer.newLine();  
    printer.println(`${senha}`);
    printer.newLine(); 
    printer.setTextSize(0,0); 
    printer.println(dataHoraFormatada);
    printer.cut();

    try {
      printer.execute();
      console.log("Impressão concluída!");
      res.send(`Impressão concluída para a senha normal ${senha}`);
      // Insira a senha no banco de dados
      db.run('INSERT INTO senhas (tipo, numero) VALUES ("FN", ?)', numeroSenha);
    } catch (error) {
      console.error("Falha na impressão:", error);
      res.status(500).send("Falha na impressão: " + error.message);
    }
  });
});

// Rota para imprimir senhas preferenciais
router.get('/gerar-senha-preferencial', function (req, res, next) {
  // Consulte o banco de dados para obter a próxima senha a ser impressa
  db.get('SELECT MAX(numero) AS max_numero FROM senhas WHERE tipo = "FP"', function (err, row) {
    if (err) {
      res.status(500).send('Erro ao consultar a próxima senha: ' + err.message);
      return;
    }

    if (row && row.max_numero !== null) {
      numeroSenha = row.max_numero + 1;
    } else {
      numeroSenha = 1;
    }

    const senha = `FP${numeroSenha}`; // Modelo de senha preferencial

    // Configura a impressora
    let printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: 'tcp://192.168.10.31'
    });
    


    printer.alignCenter();
    printer.setTextSize(1,1);  
    printer.println("Fichas");
    printer.newLine();             
    printer.println('-------------------')                           
    printer.println("PRIORITARIO");
    printer.underlineThick(false);   
    printer.newLine();  
    printer.println(`${senha}`);
    printer.newLine(); 
    printer.setTextSize(0,0); 
    printer.println(dataHoraFormatada);
    printer.cut();

    try {
      printer.execute();
      console.log("Impressão concluída!");
      res.send(`Impressão concluída para a senha preferencial ${senha}`);
      // Insira a senha no banco de dados
      db.run('INSERT INTO senhas (tipo, numero) VALUES ("FP", ?)', numeroSenha);
    } catch (error) {
      console.error("Falha na impressão:", error);
      res.status(500).send("Falha na impressão: " + error.message);
    }
  });
});

module.exports = router;
