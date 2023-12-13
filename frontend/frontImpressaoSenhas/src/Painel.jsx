// Em um novo arquivo, por exemplo, Painel.jsx
import React, { useState, useEffect } from "react";

const Painel = () => {
  const [fichasEmAndamento, setFichasEmAndamento] = useState([]);

  useEffect(() => {
    const fetchFichasEmAndamento = async () => {
      try {
        const response = await fetch("/ficha-em-andamento");
        const data = await response.json();
        setFichasEmAndamento(data.fichasEmAndamento);
      } catch (error) {
        console.error("Erro ao obter fichas em andamento:", error);
      }
    };

    fetchFichasEmAndamento();
    const intervalId = setInterval(() => {
      fetchFichasEmAndamento();
    }, 5000);
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
