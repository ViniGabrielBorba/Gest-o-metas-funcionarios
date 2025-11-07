import React, { useState, useEffect } from 'react';
import Navbar from '../layout/Navbar';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendar,
  FaBell,
  FaCheck,
  FaTimes,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import { notify } from '../../utils/notifications';

const Agenda = ({ setIsAuthenticated }) => {
  const toast = useToast();
  const { darkMode } = useDarkMode();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('mes'); // 'mes', 'semana', 'dia', 'lista'
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [busca, setBusca] = useState('');
  const [showConcluidos, setShowConcluidos] = useState(false);

  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    titulo: '',
    descricao: '',
    tipo: 'tarefa',
    prioridade: 'media',
    notificacao: {
      ativo: true,
      diasAntecedencia: 1,
      horario: '09:00'
    },
    cor: '#169486'
  });

  useEffect(() => {
    fetchEventos();
    verificarLembretes();
    
    // Verificar lembretes a cada minuto
    const interval = setInterval(verificarLembretes, 60000);
    return () => clearInterval(interval);
  }, [currentMonth, currentYear]);

  const fetchEventos = async () => {
    try {
      const response = await api.get(`/agenda/eventos?mes=${currentMonth + 1}&ano=${currentYear}`);
      setEventos(response.data.eventos || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const verificarLembretes = async () => {
    try {
      const response = await api.get('/agenda/lembretes');
      const lembretes = response.data.lembretes || [];
      
      lembretes.forEach(lembrete => {
        const dataEvento = new Date(lembrete.data);
        const hoje = new Date();
        const diasRestantes = Math.ceil((dataEvento - hoje) / (1000 * 60 * 60 * 24));
        
        const mensagem = diasRestantes === 0
          ? `⏰ ${lembrete.titulo} é HOJE!`
          : `⏰ Lembrete: ${lembrete.titulo} em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`;
        
        notify('Lembrete de Agenda', mensagem, 'info');
        
        // Marcar como notificado
        api.put(`/agenda/eventos/${lembrete._id}/notificado`);
      });
    } catch (error) {
      console.error('Erro ao verificar lembretes:', error);
    }
  };

  const handleOpenModal = (data = null, evento = null) => {
    if (evento) {
      setEditingEvento(evento);
      const dataFormatada = new Date(evento.data).toISOString().split('T')[0];
      setFormData({
        data: dataFormatada,
        titulo: evento.titulo,
        descricao: evento.descricao || '',
        tipo: evento.tipo,
        prioridade: evento.prioridade,
        notificacao: evento.notificacao,
        cor: evento.cor || '#169486'
      });
    } else {
      setEditingEvento(null);
      const dataFormatada = data ? new Date(data).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      setFormData({
        data: dataFormatada,
        titulo: '',
        descricao: '',
        tipo: 'tarefa',
        prioridade: 'media',
        notificacao: {
          ativo: true,
          diasAntecedencia: 1,
          horario: '09:00'
        },
        cor: '#169486'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvento(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvento) {
        await api.put(`/agenda/eventos/${editingEvento._id}`, formData);
      } else {
        await api.post('/agenda/eventos', formData);
      }
      handleCloseModal();
      fetchEventos();
      toast.success(editingEvento ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar evento');
    }
  };

  const handleDelete = async (eventoId) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        await api.delete(`/agenda/eventos/${eventoId}`);
        fetchEventos();
        toast.success('Evento excluído com sucesso!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao excluir evento');
      }
    }
  };

  const handleToggleConcluido = async (evento) => {
    try {
      await api.put(`/agenda/eventos/${evento._id}`, {
        concluido: !evento.concluido
      });
      fetchEventos();
      toast.success('Evento atualizado com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar evento');
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    handleOpenModal(date);
  };

  // Gerar calendário mensal
  const gerarCalendario = () => {
    const primeiroDia = new Date(currentYear, currentMonth, 1);
    const ultimoDia = new Date(currentYear, currentMonth + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaInicioSemana = primeiroDia.getDay();

    const dias = [];
    
    // Dias do mês anterior (para preencher início)
    const mesAnterior = new Date(currentYear, currentMonth, 0);
    const diasMesAnterior = mesAnterior.getDate();
    for (let i = diaInicioSemana - 1; i >= 0; i--) {
      dias.push({
        dia: diasMesAnterior - i,
        mes: currentMonth - 1,
        ano: currentYear,
        isCurrentMonth: false
      });
    }

    // Dias do mês atual
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push({
        dia,
        mes: currentMonth,
        ano: currentYear,
        isCurrentMonth: true
      });
    }

    // Dias do próximo mês (para completar grid)
    const diasRestantes = 42 - dias.length; // 6 semanas * 7 dias
    for (let dia = 1; dia <= diasRestantes; dia++) {
      dias.push({
        dia,
        mes: currentMonth + 1,
        ano: currentYear,
        isCurrentMonth: false
      });
    }

    return dias;
  };

  const getEventosDoDia = (dia, mes, ano) => {
    return eventos.filter(evento => {
      const dataEvento = new Date(evento.data);
      return dataEvento.getDate() === dia &&
             dataEvento.getMonth() === mes &&
             dataEvento.getFullYear() === ano &&
             (showConcluidos || !evento.concluido) &&
             (!filtroTipo || evento.tipo === filtroTipo) &&
             (!filtroPrioridade || evento.prioridade === filtroPrioridade) &&
             (!busca || evento.titulo.toLowerCase().includes(busca.toLowerCase()) || 
              (evento.descricao && evento.descricao.toLowerCase().includes(busca.toLowerCase())));
    });
  };

  const getCorPrioridade = (prioridade) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCorTipo = (tipo) => {
    switch (tipo) {
      case 'tarefa': return '#169486';
      case 'compromisso': return '#3b82f6';
      case 'reuniao': return '#8b5cf6';
      case 'lembrete': return '#f59e0b';
      case 'meta': return '#ef4444';
      default: return '#169486';
    }
  };

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const navegarMes = (direcao) => {
    if (direcao === 'anterior') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const eventosFiltrados = eventos.filter(evento => {
    if (!showConcluidos && evento.concluido) return false;
    if (filtroTipo && evento.tipo !== filtroTipo) return false;
    if (filtroPrioridade && evento.prioridade !== filtroPrioridade) return false;
    if (busca && !evento.titulo.toLowerCase().includes(busca.toLowerCase()) &&
        !(evento.descricao && evento.descricao.toLowerCase().includes(busca.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const eventosHoje = eventosFiltrados.filter(evento => {
    const hoje = new Date();
    const dataEvento = new Date(evento.data);
    return dataEvento.getDate() === hoje.getDate() &&
           dataEvento.getMonth() === hoje.getMonth() &&
           dataEvento.getFullYear() === hoje.getFullYear();
  });

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : ''}`}>
        <Navbar setIsAuthenticated={setIsAuthenticated} />
        <div className="flex items-center justify-center h-96">
          <div className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : ''}`}>
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <FaCalendar /> Agenda
            </h1>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Gerencie seus compromissos e tarefas</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Novo Evento
          </button>
        </div>

        {/* Filtros e Busca */}
        <div className={`card mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="input-field"
              >
                <option value="">Todos os tipos</option>
                <option value="tarefa">Tarefa</option>
                <option value="compromisso">Compromisso</option>
                <option value="reuniao">Reunião</option>
                <option value="lembrete">Lembrete</option>
                <option value="meta">Meta</option>
              </select>
            </div>
            <div>
              <select
                value={filtroPrioridade}
                onChange={(e) => setFiltroPrioridade(e.target.value)}
                className="input-field"
              >
                <option value="">Todas as prioridades</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showConcluidos}
                  onChange={(e) => setShowConcluidos(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Mostrar concluídos</span>
              </label>
            </div>
          </div>
        </div>

        {/* Tarefas de Hoje */}
        {eventosHoje.length > 0 && (
          <div className="card mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaBell /> Tarefas de Hoje ({eventosHoje.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {eventosHoje.map(evento => (
                <div
                  key={evento._id}
                  className="bg-white p-3 rounded-lg border-l-4"
                  style={{ borderLeftColor: getCorTipo(evento.tipo) }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold ${evento.concluido ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {evento.titulo}
                    </h3>
                    <span className={`w-3 h-3 rounded-full ${getCorPrioridade(evento.prioridade)}`}></span>
                  </div>
                  {evento.descricao && (
                    <p className="text-sm text-gray-600 mb-2">{evento.descricao}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleConcluido(evento)}
                      className={`text-xs px-2 py-1 rounded ${
                        evento.concluido
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {evento.concluido ? <FaTimes /> : <FaCheck />} {evento.concluido ? 'Desfazer' : 'Concluir'}
                    </button>
                    <button
                      onClick={() => handleOpenModal(null, evento)}
                      className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendário */}
        <div className={`card mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {meses[currentMonth]} {currentYear}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => navegarMes('anterior')}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
              >
                ←
              </button>
              <button
                onClick={() => {
                  setCurrentMonth(new Date().getMonth());
                  setCurrentYear(new Date().getFullYear());
                }}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Hoje
              </button>
              <button
                onClick={() => navegarMes('proximo')}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Cabeçalho dos dias da semana */}
            {diasSemana.map(dia => (
              <div key={dia} className="p-2 text-center font-semibold text-gray-700 bg-gray-100 rounded">
                {dia}
              </div>
            ))}

            {/* Dias do calendário */}
            {gerarCalendario().map((diaInfo, index) => {
              const eventosDia = getEventosDoDia(diaInfo.dia, diaInfo.mes, diaInfo.ano);
              const hoje = new Date();
              const isHoje = diaInfo.isCurrentMonth &&
                            diaInfo.dia === hoje.getDate() &&
                            diaInfo.mes === hoje.getMonth() &&
                            diaInfo.ano === hoje.getFullYear();

              return (
                <div
                  key={index}
                  onClick={() => diaInfo.isCurrentMonth && handleDateClick(new Date(diaInfo.ano, diaInfo.mes, diaInfo.dia))}
                  className={`p-2 min-h-[80px] border rounded cursor-pointer transition-colors ${
                    diaInfo.isCurrentMonth
                      ? isHoje
                        ? 'bg-blue-100 border-blue-400'
                        : 'bg-white hover:bg-gray-50'
                      : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${isHoje ? 'text-blue-600' : ''}`}>
                    {diaInfo.dia}
                  </div>
                  <div className="space-y-1">
                    {eventosDia.slice(0, 3).map(evento => (
                      <div
                        key={evento._id}
                        className="text-xs p-1 rounded truncate"
                        style={{
                          backgroundColor: getCorTipo(evento.tipo) + '20',
                          color: getCorTipo(evento.tipo),
                          borderLeft: `3px solid ${getCorTipo(evento.tipo)}`
                        }}
                        title={evento.titulo}
                      >
                        {evento.titulo}
                      </div>
                    ))}
                    {eventosDia.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{eventosDia.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de Eventos */}
        {viewMode === 'lista' && (
          <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Todos os Eventos</h2>
            <div className="space-y-2">
              {eventosFiltrados.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum evento encontrado</p>
              ) : (
                eventosFiltrados.map(evento => (
                  <div
                    key={evento._id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-semibold ${evento.concluido ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {evento.titulo}
                          </h3>
                          <span className={`w-2 h-2 rounded-full ${getCorPrioridade(evento.prioridade)}`}></span>
                          <span className="text-xs px-2 py-1 rounded" style={{
                            backgroundColor: getCorTipo(evento.tipo) + '20',
                            color: getCorTipo(evento.tipo)
                          }}>
                            {evento.tipo}
                          </span>
                        </div>
                        {evento.descricao && (
                          <p className="text-sm text-gray-600 mb-2">{evento.descricao}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(evento.data).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        {evento.notificacao.ativo && (
                          <p className="text-xs text-blue-600 mt-1">
                            <FaBell className="inline mr-1" />
                            Lembrete: {evento.notificacao.diasAntecedencia} dia(s) antes às {evento.notificacao.horario}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleConcluido(evento)}
                          className={`p-2 rounded ${
                            evento.concluido
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {evento.concluido ? <FaTimes /> : <FaCheck />}
                        </button>
                        <button
                          onClick={() => handleOpenModal(null, evento)}
                          className="p-2 rounded bg-blue-100 text-blue-700"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(evento._id)}
                          className="p-2 rounded bg-red-100 text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Evento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingEvento ? 'Editar Evento' : 'Novo Evento'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="input-field"
                    required
                    placeholder="Ex: Reunião com equipe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Detalhes do evento..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="input-field"
                    >
                      <option value="tarefa">Tarefa</option>
                      <option value="compromisso">Compromisso</option>
                      <option value="reuniao">Reunião</option>
                      <option value="lembrete">Lembrete</option>
                      <option value="meta">Meta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridade
                    </label>
                    <select
                      value={formData.prioridade}
                      onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                      className="input-field"
                    >
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Lembrete</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.notificacao.ativo}
                        onChange={(e) => setFormData({
                          ...formData,
                          notificacao: { ...formData.notificacao, ativo: e.target.checked }
                        })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Ativar lembrete</span>
                    </label>

                    {formData.notificacao.ativo && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dias de antecedência
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={formData.notificacao.diasAntecedencia}
                            onChange={(e) => setFormData({
                              ...formData,
                              notificacao: { ...formData.notificacao, diasAntecedencia: parseInt(e.target.value) }
                            })}
                            className="input-field"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Horário do lembrete
                          </label>
                          <input
                            type="time"
                            value={formData.notificacao.horario}
                            onChange={(e) => setFormData({
                              ...formData,
                              notificacao: { ...formData.notificacao, horario: e.target.value }
                            })}
                            className="input-field"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {editingEvento ? 'Atualizar' : 'Criar'} Evento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;

