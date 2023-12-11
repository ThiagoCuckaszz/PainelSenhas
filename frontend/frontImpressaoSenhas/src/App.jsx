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
      setError(null); 
    } catch (error) {
      console.error('Erro na solicitação ao backend:', error);
      setError('Falha na impressão. Verifique a conexão com a impressora.');
    }
  };
  
  const handleRetryClick = async () => {
    setRetrying(true);
    setError(null); 
    
    try {
      const response = await axios.get('http://localhost:3000/reconectar');
      console.log(response.data);
      setError(null); 
    } catch (error) {
      console.error('Erro na tentativa de reconexão:', error);
      setError('Falha na reconexão com a impressora.');
    }
    
    setRetrying(false);
  };
  
  return (
    <div>
      <img src="/logo.png" className="logo" alt="Saude logo" />
      <h1>Retire Sua Senha</h1>
      <div className="card">
        <button className='btn_inciais' onClick={() => handleButtonClick('consulta')}>CONSULTA</button>
        <button className='btn_inciais'onClick={() => handleButtonClick('preventivo')}>PREVENTIVO</button>
        <button className='btn_laboratoriais' onClick={() => handleButtonClick('exames-laboratoriais')}>EXAMES LABORATORIAIS</button>
        <button className='btn_laboratoriais' onClick={() => handleButtonClick('exames-nao-laboratoriais')}>EXAMES NÃO LABORATORIAIS</button>
      </div>
    </div>
  );
}

export default App;
