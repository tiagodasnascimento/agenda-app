import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './App.css';

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const API_URL = 'http://localhost:3001/api/eventos';

function App() {
  const [eventos, setEventos] = useState([]);

  const buscarEventos = useCallback(async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    const eventosFormatados = data.map(evento => ({
      ...evento,
      start: new Date(evento.data_inicio),
      end: new Date(evento.data_fim),
      title: evento.titulo,
    }));
    setEventos(eventosFormatados);
  }, []);

  useEffect(() => {
    buscarEventos();
  }, [buscarEventos]);

  const handleSelectSlot = useCallback(async ({ start, end }) => {
    const titulo = window.prompt('Digite o título do novo evento:');
    if (titulo) {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, data_inicio: start.toISOString(), data_fim: end.toISOString() }),
      });
      buscarEventos();
    }
  }, [buscarEventos]);

  const handleSelectEvent = useCallback(async (evento) => {
    if (window.confirm(`Tem certeza que deseja excluir o evento "${evento.title}"?`)) {
      await fetch(`${API_URL}/${evento.id}`, { method: 'DELETE' });
      buscarEventos();
    }
  }, [buscarEventos]);

  return (
    <div className="App">
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '95vh' }}
        culture='pt-BR'
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        messages={{
          next: "Próximo",
          previous: "Anterior",
          today: "Hoje",
          month: "Mês",
          week: "Semana",
          day: "Dia",
        }}
      />
    </div>
  );
}

export default App;