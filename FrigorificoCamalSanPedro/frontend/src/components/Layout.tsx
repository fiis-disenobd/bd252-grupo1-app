import { Outlet, useLocation } from 'react-router-dom';
import Sidebar, { NAV_ITEMS } from './Sidebar';

const Layout = () => {
  const location = useLocation();
  const currentSection =
    NAV_ITEMS.find((item) =>
      item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
    ) ?? NAV_ITEMS[0];

  return (
    <div className="flex min-h-screen bg-[#f8f6f2] text-stone-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-primary text-white px-12 py-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.4em] text-white/70">
            Sistema de Ventas {'\u2013'} Camal San Pedro
          </p>
          <h1 className="text-2xl font-semibold tracking-wide mt-2">
            {currentSection.header.toUpperCase()}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
