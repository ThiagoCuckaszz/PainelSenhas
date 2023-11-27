import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);



  const handleButtonClick = async (tipoFicha) => {
    try {
      const response = await axios.post(`http://localhost:3000/atender_${tipoFicha}`);
      console.log(response.data);
      setError(null); 
    } catch (error) {
      console.error('Erro na solicitação ao backend:', error);
      setError('Falha na impressão. Verifique a conexão com a impressora.');
    }
  };

  return (
    <div>
      <h1>Atendimento Senhas</h1>
      <div className="card">
        <button onClick={() => handleButtonClick('consulta')}>ATENDER CONSULTA</button>
        <button onClick={() => handleButtonClick('preventivo')}>ATENDER PREVENTIVO</button>
        <button onClick={() => handleButtonClick('exames-laboratoriais')}>ATENDER EXAMES LABORATORIAIS</button>
        <button onClick={() => handleButtonClick('exames-nao-laboratoriais')}>ATENDER EXAMES NÃO LABORATORIAIS</button>
      </div>
      <p className="read-the-docs">By Thiago Cuckasz</p>
    </div>
  );
}

export default App;
