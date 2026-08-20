import { FC } from 'react';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: FC<NavbarProps> = ({ onLogout }) => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  return (
    <div className="navbar">
      <h1>Clínica de Vacinação</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span>{user?.nome}</span>
        <button onClick={onLogout}>Sair</button>
      </div>
    </div>
  );
};

export default Navbar;
