import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";

// Gestión de cliente
import Clientes from "./pages/gestion-cliente/Clientes";
import AtencionCliente from "./pages/gestion-cliente/AtencionCliente";

// Gestión de producto
import Productos from "./pages/gestion-producto/Productos";

// Menú de Cierre de Ventas (3 botones)
import VentasMenu from "./pages/gestion-ventas/Ventas";

// Historial de Ventas
import HistorialVentasPage from "./pages/gestion-ventas/HistorialVentasPage";

// Cierre de venta
import CerrarVentaPage from "./pages/gestion-ventas/CerrarVentaPage";
import DetalleCierreVentaPage from "./pages/gestion-ventas/DetalleCierreVentaPage";

// Entrega de pedidos
import EntregaPedidosPage from "./pages/gestion-ventas/EntregaPedidoPage";

// Gestión de reclamos
import Reclamos from "./pages/gestion-reclamo/Reclamos";

// Gestión de reportes
import Reportes from "./pages/gestion-reportes/Reportes";
import ReporteVentasDia from "./pages/gestion-reportes/ReporteVentasDia";
import ReporteStockOcupacion from "./pages/gestion-reportes/ReporteStockOcupacion";
import ReporteTrazabilidad from "./pages/gestion-reportes/ReporteTrazabilidad";
import ReporteTransporte from "./pages/gestion-reportes/ReporteTransporte";
import ReporteTopClientes from "./pages/gestion-reportes/ReporteTopClientes";
import ReporteProgramacion from "./pages/gestion-reportes/ReporteProgramacion";

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Principal */}
        <Route index element={<Dashboard />} />

        {/* Cliente */}
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/atencion" element={<AtencionCliente />} />

        {/* Producto */}
        <Route path="productos" element={<Productos />} />

        {/* Cierre de ventas */}
        <Route path="ventas" element={<VentasMenu />} />
        <Route path="ventas/historial" element={<HistorialVentasPage />} />
        <Route path="ventas/cerrar" element={<CerrarVentaPage />} />
        <Route path="ventas/cerrar/:idPedido" element={<DetalleCierreVentaPage />} />
        <Route path="ventas/entrega" element={<EntregaPedidosPage />} />

        {/* Reclamos */}
        <Route path="reclamos" element={<Reclamos />} />

        {/* Reportes */}
        <Route path="reportes" element={<Reportes />} />
        <Route path="reportes/ventas-dia" element={<ReporteVentasDia />} />
        <Route path="reportes/stock-ocupacion" element={<ReporteStockOcupacion />} />
        <Route path="reportes/trazabilidad" element={<ReporteTrazabilidad />} />
        <Route path="reportes/transporte" element={<ReporteTransporte />} />
        <Route path="reportes/top-clientes" element={<ReporteTopClientes />} />
        <Route path="reportes/programacion" element={<ReporteProgramacion />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
