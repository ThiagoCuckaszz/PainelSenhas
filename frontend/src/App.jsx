import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  const handleButtonClick = async (tipoFicha) => {
    try {
      const response = await axios.post(`http://localhost:3000/gerar-ficha-${tipoFicha}`);
      console.log(response.data); // Manipule a resposta do servidor aqui, se necessário
    } catch (error) {
      console.error('Erro na solicitação ao backend:', error);
    }
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
