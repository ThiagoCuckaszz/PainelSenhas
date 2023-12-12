import { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [lastTicket, setLastTicket] = useState(null);
  const [lastTicketType, setLastTicketType] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/ultimas-fichas-por-tipo');
      console.log(response)
      const fichasEmAndamento = response.data.fichasEmAndamento;
  
      if (fichasEmAndamento.length > 0) {
        const lastFicha = fichasEmAndamento[fichasEmAndamento.length - 1];
        setLastTicket(lastFicha.senha);
        setLastTicketType(lastFicha.tipo);
      }
    } catch (error) {
      console.log(error);
    }
  };
  

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <h1>Última Senha: {lastTicket}</h1>
      <h2>Tipo: {lastTicketType}</h2>
    </div>
  );
}
