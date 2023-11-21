import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const handleButtonClick = async (tipoFicha) => {
    try {
      const response = await axios.post(`http://localhost:3000/${tipoFicha}`);
      console.log(response.data);
      setError(null); // Limpa qualquer erro anterior
    } catch (error) {
      console.error('Erro na solicitação ao backend:', error);
      setError('Falha na impressão. Verifique a conexão com a impressora.');
    }
  };

  const handleRetryClick = async () => {
    setRetrying(true);
    setError(null); // Limpa o erro

    try {
      const response = await axios.get('http://localhost:3000/reconectar');
      console.log(response.data);
      setError(null); // Limpa qualquer erro de reconexão
    } catch (error) {
      console.error('Erro na tentativa de reconexão:', error);
      setError('Falha na reconexão com a impressora.');
    }

    setRetrying(false);
  };

  return (
    <div>
      <h1>Totem Senhas</h1>
      <div className="card">
        <button onClick={() => handleButtonClick('consulta')}>CONSULTA</button>
        <button onClick={() => handleButtonClick('preventivo')}>PREVENTIVO</button>
        <button onClick={() => handleButtonClick('exames-laboratoriais')}>EXAMES LABORATORIAIS</button>
        <button onClick={() => handleButtonClick('exames-nao-laboratoriais')}>EXAMES NÃO LABORATORIAIS</button>
      </div>
      <img src="/logo.png" className="logo" alt="Saude logo" />
      <p className="read-the-docs">By Thiago Cuckasz</p>
    </div>
  );
}

export default App;
