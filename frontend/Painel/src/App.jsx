import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import io from "socket.io-client"
const socket = io.connect("http://localhost:3001")

const handleRequestError = (error, errorMessage) => {
  console.error('Erro na solicitação ao backend:', error);
  setError(errorMessage);
};

const AtenderButton = ({ tipo, onAtender }) => (
  <button onClick={() => onAtender(tipo)}>ATENDER {tipo.toUpperCase()}</button>
);

function App() {
  const [error, setError] = useState(null);
  const [dados, setDados] = useState([]);
  const [tipoSelecionado, setTipoSelecionado] = useState('');

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/ficha-em-andamento');
      setDados(response.data.fichasEmAndamento);
      setError(null);
    } catch (error) {
      handleRequestError(error, 'Falha ao obter informações de ficha em andamento.');
    }
  };

  const handleButtonClick = async (tipoFicha) => {
    try {
      // Construa a rota a partir do tipo selecionado
      const rota = `atender_${tipoFicha.toLowerCase().replace(/\s/g, '-')}`;
      await axios.post(`http://localhost:3000/${rota}`);
      console.log('Ficha atendida:', tipoFicha);
      setError(null);
      fetchData();
    } catch (error) {
      handleRequestError(error, 'Falha na impressão. Verifique a conexão com a impressora.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const exibirInformacoesPorTipo = (tipo) => {
    const informacoesPorTipo = dados.find(item => item.tipo === tipo);

    if (informacoesPorTipo) {
      const { tipo, lastFicha } = informacoesPorTipo;
      return (
        <div className="card">
          <p>Tipo: {tipo}</p>
           <div className="div-ultima-ficha">
          <p>Última Ficha: {lastFicha}</p>
        </div>
        </div>
        
      );
      
    } else {
      return (
        <div>
          <div className="card">
            <p>Nenhuma consulta marcada.</p>
            <div>
            </div>
          </div>
          <button onClick={() => fetchData()}>
                CHAMAR PRÓXIMA FICHA
          </button>
        </div>
      );
    }
  };

  const handleTipoChange = (event) => {
    setTipoSelecionado(event.target.value);
  };

  return (
    <div className='container'>

      <img className='logo-painel' src="/logo.png" alt="" />
      <br />
      {error && <p className="error-message">{error}</p>}

      {/* Lista suspensa para selecionar o tipo */}
      <label className='titulo-painel-selecionar' htmlFor="tipoSelect">Selecione o atendimento</label>
      <br></br>
      <select id="tipoSelect" value={tipoSelecionado} onChange={handleTipoChange}>
        <option disabled value="">Selecione...</option>
        <option value="Consulta">Consulta</option>
        <option value="Preventivo">Preventivo</option>
        <option value="Exames Laboratoriais">Exames Laboratoriais</option>
        <option value="Exames Nao Laboratoriais">Exames Nao Laboratoriais</option>
      </select>

      {tipoSelecionado && exibirInformacoesPorTipo(tipoSelecionado)}

      {/* Botões dinâmicos */}
      {dados
        .filter(item => item.tipo === tipoSelecionado)
        .map((item, index) => (
          <AtenderButton key={index} tipo={item.tipo} onAtender={handleButtonClick} />
        ))}
    </div>
  );
}

export default App;
