import { FC, useState, useEffect } from 'react';

interface Cliente {
  id: string;
  nome_completo: string;
  telefone: string;
  email: string;
}

const Clientes: FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/clientes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/clientes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomeCompleto: nome,
          telefone,
          email,
        }),
      });
      if (res.ok) {
        setNome('');
        setTelefone('');
        setEmail('');
        setShowForm(false);
        fetchClientes();
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Clientes</h2>
        <button onClick={() => setShowForm(!showForm)}>+ Novo Cliente</button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <form onSubmit={handleAddCliente}>
            <div className="form-group">
              <label>Nome Completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button type="submit">Cadastrar Cliente</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: '#95a5a6', marginLeft: '10px' }}>
              Cancelar
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center' }}>Nenhum cliente cadastrado</td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nome_completo}</td>
                  <td>{cliente.telefone || '-'}</td>
                  <td>{cliente.email || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clientes;
