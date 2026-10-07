import { FC, useState, useEffect } from 'react';

interface ContaReceber {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
}

const Financeiro: FC = () => {
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [caixaStatus, setCaixaStatus] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [contasRes, caixaRes] = await Promise.all([
        fetch('/financeiro/contas-receber', { headers }),
        fetch('/financeiro/caixa/status', { headers }),
      ]);

      if (contasRes.ok) {
        const data = await contasRes.json();
        setContas(data);
      }

      if (caixaRes.ok) {
        const data = await caixaRes.json();
        setCaixaStatus(data);
      }
    } catch (err) {
      console.error('Erro ao carregar financeiro:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pago: 'success',
      pendente: 'warning',
      em_atraso: 'danger',
    };
    return colors[status] || 'info';
  };

  const handleAbrirCaixa = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/financeiro/caixa/abrir', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ saldoInicial: 100 }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const handleFecharCaixa = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/financeiro/caixa/fechar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Financeiro</h2>

      {caixaStatus && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Status do Caixa</h3>
          <p>Saldo Inicial: R$ {caixaStatus.saldoInicial || 0}</p>
          <p>Saldo Atual: R$ {caixaStatus.saldoAtual || 0}</p>
          <p>Status: <span className={`badge ${caixaStatus.status === 'aberto' ? 'success' : 'danger'}`}>{caixaStatus.status}</span></p>
          {caixaStatus.status === 'aberto' ? (
            <button onClick={handleFecharCaixa} className="danger">Fechar Caixa</button>
          ) : (
            <button onClick={handleAbrirCaixa}>Abrir Caixa</button>
          )}
        </div>
      )}

      <div className="table-container">
        <h3>Contas a Receber</h3>
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {contas.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>Nenhuma conta a receber</td>
              </tr>
            ) : (
              contas.map((conta) => (
                <tr key={conta.id}>
                  <td>{conta.descricao}</td>
                  <td>R$ {conta.valor.toFixed(2)}</td>
                  <td>{new Date(conta.vencimento).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <span className={`badge ${getStatusColor(conta.status)}`}>
                      {conta.status}
                    </span>
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

export default Financeiro;
