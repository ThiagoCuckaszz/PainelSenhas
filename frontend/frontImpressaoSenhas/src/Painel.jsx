// Em um novo arquivo, por exemplo, Painel.jsx
import React, { useState, useEffect } from 'react';

const Painel = () => {
  const [fichasEmAndamento, setFichasEmAndamento] = useState([]);

  useEffect(() => {
    const fetchFichasEmAndamento = async () => {
      try {
        const response = await fetch('/ficha-em-andamento');
        const data = await response.json();
        setFichasEmAndamento(data.fichasEmAndamento);
      } catch (error) {
        console.error('Erro ao obter fichas em andamento:', error);
      }
    };

    // Execute a busca ao montar o componente
    fetchFichasEmAndamento();

    // Defina um intervalo para buscar periodicamente as fichas em andamento (opcional)
    const intervalId = setInterval(() => {
      fetchFichasEmAndamento();
    }, 5000); // Atualize a cada 5 segundos, por exemplo

    // Limpe o intervalo ao desmontar o componente
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <h1>Painel de Atendimento</h1>
      <ul>
        {fichasEmAndamento.map((ficha, index) => (
          <li key={index}>
            Tipo: {ficha.tipo}, Última Ficha: {ficha.lastFicha}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Painel;
