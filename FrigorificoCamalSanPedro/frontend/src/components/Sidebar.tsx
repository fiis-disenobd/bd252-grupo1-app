import { NavLink } from 'react-router-dom';
import logo from '@/assets/images/CamalSanPedro.jpg';

export type NavigationItem = {
  path: string;
  label: string;
  header: string;
};

export const NAV_ITEMS: NavigationItem[] = [
  { path: '/', label: 'Dashboard', header: 'Dashboard' },
  { path: '/clientes', label: 'Gestión del Cliente', header: 'Gestión de Clientes' },
  { path: '/productos', label: 'Gestión del Producto', header: 'Gestión de Productos' },
  { path: '/ventas', label: 'Gestión de Ventas', header: 'Gestión de Ventas' },
  { path: '/reclamos', label: 'Gestión de Reclamos', header: 'Gestión de Reclamos' },
  { path: '/reportes', label: 'Gestión de Reportes', header: 'Gestión de Reportes' },
];

const Sidebar = () => {
  return (
    <aside className="w-72 bg-white border-r border-stone-200 shadow-[10px_0_30px_rgba(0,0,0,0.04)] flex flex-col">
      <div className="h-40 flex items-center justify-center border-b border-stone-100 bg-white">
        <img src={logo} alt="Frigorífico Camal San Pedro" className="object-contain max-h-32" />
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg text-sm font-semibold tracking-wide uppercase transition-colors duration-200 ${
                isActive ? 'bg-primary text-white shadow-md' : 'text-primary/70 hover:bg-amber-50'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
