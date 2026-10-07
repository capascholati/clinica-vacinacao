import { FC, useState, useEffect } from 'react';

interface Vacina {
  id: string;
  nome: string;
  estoque_minimo: number;
  estoque_ideal: number;
  permite_estoque_negativo: boolean;
}

const Estoque: FC = () => {
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState(10);
  const [estoqueIdeal, setEstoqueIdeal] = useState(30);

  useEffect(() => {
    fetchVacinas();
  }, []);

  const fetchVacinas = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/cadastros/vacinas', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setVacinas(data);
    } catch (err) {
      console.error('Erro ao carregar vacinas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVacina = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/cadastros/vacinas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          estoqueMinimo,
          estoqueIdeal,
          permiteEstoqueNegativo: false,
        }),
      });
      if (res.ok) {
        setNome('');
        setShowForm(false);
        fetchVacinas();
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Estoque de Vacinas</h2>
        <button onClick={() => setShowForm(!showForm)}>+ Nova Vacina</button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <form onSubmit={handleAddVacina}>
            <div className="form-row">
              <div className="form-group">
                <label>Nome da Vacina</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Estoque Mínimo</label>
                <input
                  type="number"
                  value={estoqueMinimo}
                  onChange={(e) => setEstoqueMinimo(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Estoque Ideal</label>
              <input
                type="number"
                value={estoqueIdeal}
                onChange={(e) => setEstoqueIdeal(parseInt(e.target.value))}
              />
            </div>
            <button type="submit">Cadastrar Vacina</button>
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
              <th>Estoque Mínimo</th>
              <th>Estoque Ideal</th>
              <th>Permite Negativo</th>
            </tr>
          </thead>
          <tbody>
            {vacinas.map((vacina) => (
              <tr key={vacina.id}>
                <td>{vacina.nome}</td>
                <td>{vacina.estoque_minimo}</td>
                <td>{vacina.estoque_ideal}</td>
                <td>
                  <span className={`badge ${vacina.permite_estoque_negativo ? 'warning' : 'danger'}`}>
                    {vacina.permite_estoque_negativo ? 'Sim' : 'Não'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Estoque;
