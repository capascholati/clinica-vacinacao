import { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: '📊 Dashboard' },
    { path: '/estoque', label: '📦 Estoque' },
    { path: '/agenda', label: '📅 Agenda' },
    { path: '/clientes', label: '👥 Clientes' },
    { path: '/financeiro', label: '💰 Financeiro' },
  ];

  return (
    <div className="sidebar">
      <nav>
        {menuItems.map((item) => (
          <a
            key={item.path}
            onClick={() => navigate(item.path)}
            className={location.pathname === item.path ? 'active' : ''}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
