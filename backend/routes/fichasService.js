const sqlite3 = require('sqlite3').verbose();
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

const db = new sqlite3.Database('fichas.db');
db.serialize(function () {
    db.run('CREATE TABLE IF NOT EXISTS fichas (id INTEGER PRIMARY KEY AUTOINCREMENT, tipo TEXT, numero INT, data DATETIME, hora DATETIME, atendido Boolean DEFAULT FALSE)');
});

let numeroFichas = {
    "Consulta": 0,
    "Preventivo": 0,
    "Exames Laboratoriais": 0,
    "Exames Não Laboratoriais": 0,
};

let dataUltimaFicha = null;
const dataHoraAtual = new Date().toLocaleString();
const dataAtual = new Date().toLocaleDateString();
const horaAtual = new Date().toLocaleTimeString();

function obterUltimaFichaImprimida() {
    db.all('SELECT tipo, MAX(numero) as lastFicha FROM fichas WHERE data = ? GROUP BY tipo', [dataAtual], function (err, rows) {
        if (!err && rows) {
            console.log(rows)
            rows.forEach((row) => {
                if (row.tipo && row.lastFicha) {
                    numeroFichas[row.tipo] = row.lastFicha;

                }
            });
        }
    });
}

dataUltimaFicha = dataAtual;
obterUltimaFichaImprimida();

function gerarFicha(tipoFicha, res) {
    if (dataAtual !== dataUltimaFicha) {
        console.log(dataAtual, dataUltimaFicha, "teste1")
        dataUltimaFicha = dataAtual;
        obterUltimaFichaImprimida();
    } else {
        console.log(dataAtual, dataUltimaFicha, "teste2")
        numeroFichas[tipoFicha]++;
    }

    const ficha = `${numeroFichas[tipoFicha].toString().padStart(3, '0')}`;

    let printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: 'tcp://192.168.10.31',
        options: {
            timeout: 500000
        }
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
    printer.setTextSize(0, 0);
    printer.println(dataHoraAtual);
    printer.cut();

    try {
        printer.execute();
        console.log("Impressão concluída!");
        db.run('INSERT INTO fichas (tipo, numero, data, hora) VALUES (?, ?, ?,?)', tipoFicha, numeroFichas[tipoFicha], dataAtual, horaAtual);
        res.send(`Impressão concluída para a ficha de ${tipoFicha} ${ficha}`);
    } catch (error) {
        console.error("Falha na impressão:", error);
        res.status(500).send("Falha na impressão: " + error.message);
    }
}


function atender(tipoFicha, res) {
    db.all('SELECT id, Min(numero) as lastFicha FROM fichas WHERE data = ? AND atendido = "0" and tipo = ? GROUP BY tipo', [dataAtual, tipoFicha], function (err, fichaChamar) {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao consultar o banco de dados');
        }

        if (fichaChamar.length > 0) {
            const id_update = fichaChamar[0].id;

            db.run('UPDATE fichas SET atendido = 1 WHERE id = ?', [id_update], function (err) {
                if (err) {
                    console.error('Erro ao atualizar ficha:', err);
                    return res.status(500).send('Erro ao atualizar ficha no banco de dados');
                }

                console.log('Ficha atendida com sucesso.');
                res.json({ fichas: fichaChamar });
            });
        } else {
            console.error('Nenhuma ficha encontrada para os critérios especificados.');
            res.status(404).send('Nenhuma ficha encontrada para os critérios especificados.');
        }
    });
}

module.exports = { obterUltimaFichaImprimida, gerarFicha, atender}