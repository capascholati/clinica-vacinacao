import { FC, useState, useEffect } from 'react';

const Dashboard: FC = () => {
  const [stats, setStats] = useState({
    usuarios: 0,
    vacinas: 0,
    agendamentos: 0,
    clientes: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [usuarios, vacinas, agendamentos, clientes] = await Promise.all([
          fetch('http://localhost:3333/usuarios', { headers }).then((r) => r.json()).then((d) => d.length),
          fetch('http://localhost:3333/cadastros/vacinas', { headers }).then((r) => r.json()).then((d) => d.length),
          fetch('http://localhost:3333/agenda', { headers }).then((r) => r.json()).then((d) => d.length),
          fetch('http://localhost:3333/clientes', { headers }).then((r) => r.json()).then((d) => d.length),
        ]);

        setStats({ usuarios, vacinas, agendamentos, clientes });
      } catch (err) {
        console.error('Erro ao carregar stats:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>👥 Usuários</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3498db' }}>{stats.usuarios}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>💉 Vacinas</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2ecc71' }}>{stats.vacinas}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>📅 Agendamentos</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f39c12' }}>{stats.agendamentos}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>🧑 Clientes</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#9b59b6' }}>{stats.clientes}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
