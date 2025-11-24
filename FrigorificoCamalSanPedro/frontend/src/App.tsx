import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Ventas from './pages/Ventas';
import Reclamos from './pages/Reclamos';
import Reportes from './pages/Reportes';
import ReporteVentasDia from './pages/ReporteVentasDia';
import ReporteStockOcupacion from './pages/ReporteStockOcupacion';
import ReporteTrazabilidad from './pages/ReporteTrazabilidad';
import ReporteTransporte from './pages/ReporteTransporte';
import ReporteTopClientes from './pages/ReporteTopClientes';
import ReporteProgramacion from './pages/ReporteProgramacion';

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
