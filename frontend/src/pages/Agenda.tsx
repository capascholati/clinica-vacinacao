import { FC, useState, useEffect } from 'react';

interface Agendamento {
  id: string;
  cliente_id: string;
  vacina_id: string;
  data: string;
  horario: string;
  status: string;
}

const Agenda: FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const fetchAgendamentos = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:3333/agenda', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setAgendamentos(data);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      agendado: 'info',
      confirmado: 'success',
      cancelado: 'danger',
      aplicado: 'success',
    };
    return colors[status] || 'info';
  };

  return (
    <div>
      <h2>Agenda</h2>
      <div className="table-container" style={{ marginTop: '20px' }}>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Horário</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>Nenhum agendamento</td>
              </tr>
            ) : (
              agendamentos.map((ag) => (
                <tr key={ag.id}>
                  <td>{new Date(ag.data).toLocaleDateString('pt-BR')}</td>
                  <td>{ag.horario}</td>
                  <td>
                    <span className={`badge ${getStatusColor(ag.status)}`}>
                      {ag.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button>Editar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Agenda;
