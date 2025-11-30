import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/gestion-cliente/Clientes';
import Productos from './pages/gestion-producto/Productos';
import Ventas from './pages/gestion-ventas/Ventas';
import Reclamos from './pages/gestion-reclamo/Reclamos';
import Reportes from './pages/gestion-reportes/Reportes';
import ReporteVentasDia from './pages/gestion-reportes/ReporteVentasDia';
import ReporteStockOcupacion from './pages/gestion-reportes/ReporteStockOcupacion';
import ReporteTrazabilidad from './pages/gestion-reportes/ReporteTrazabilidad';
import ReporteTransporte from './pages/gestion-reportes/ReporteTransporte';
import ReporteTopClientes from './pages/gestion-reportes/ReporteTopClientes';
import ReporteProgramacion from './pages/gestion-reportes/ReporteProgramacion';

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="productos" element={<Productos />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="reclamos" element={<Reclamos />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="reportes/ventas-dia" element={<ReporteVentasDia />} />
        <Route path="reportes/stock-ocupacion" element={<ReporteStockOcupacion />} />
        <Route path="reportes/trazabilidad" element={<ReporteTrazabilidad />} />
        <Route path="reportes/transporte" element={<ReporteTransporte />} />
        <Route path="reportes/top-clientes" element={<ReporteTopClientes />} />
        <Route path="reportes/programacion" element={<ReporteProgramacion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
