'use client';
import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import Card from '@/components/Card';
import { ApiLoading } from '@/components/ApiLoading';
import { useAuth } from '@/lib/supabase/auth-context';
import { useSuperAdminMetrics } from '@/lib/hooks/useSuperAdminMetrics';
import HistoricalAnalysisDashboard, { exportHistoricalCsv } from '@/components/HistoricalAnalysisDashboard';

function formatNumber(value) {
  return Number(value || 0).toLocaleString('es-PE');
}

function formatMoney(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`;
}

function normalizeRows(rows, labelKey, valueKey = 'count') {
  return (rows || []).map(row => ({
    label: row[labelKey] || 'Sin dato',
    value: row[valueKey] || 0,
  }));
}

function exportMetricsCsv(metrics) {
  if (!metrics) return;

  const summary = metrics.summary || {};
  const rows = [
    ['Seccion', 'Metrica', 'Valor'],
    ['Resumen', 'Clientes', summary.totalCustomers],
    ['Resumen', 'Duenos de negocio', summary.totalOwners],
    ['Resumen', 'Negocios registrados', summary.totalBusinesses],
    ['Resumen', 'Negocios activos', summary.activeBusinesses],
    ['Resumen', 'Productos activos', summary.activeProducts],
    ['Resumen', 'Productos vencidos', summary.expiredProducts],
    ['Resumen', 'Pedidos totales', summary.totalOrders],
    ['Resumen', 'Pedidos entregados', summary.deliveredOrders],
    ['Resumen', 'Pedidos cancelados', summary.cancelledOrders],
    ['Resumen', 'Ventas entregadas', summary.totalSales],
    ['Impacto', 'Comidas rescatadas', summary.mealsRescued],
    ['Impacto', 'Dinero ahorrado', summary.moneySaved],
    ['Impacto', 'CO2 evitado', summary.co2Avoided],
    ...normalizeRows(metrics.ordersByStatus, 'status').map(row => ['Pedidos por estado', row.label, row.value]),
    ...normalizeRows(metrics.productsByCategory, 'category').map(row => ['Productos por categoria', row.label, row.value]),
    ...normalizeRows(metrics.businessesByDistrict, 'district').map(row => ['Negocios por distrito', row.label, row.value]),
    ...(metrics.monthlySales || []).map(row => ['Ventas mensuales', row.period, row.sales]),
  ];

  const csv = rows
    .map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `comeya-metricas-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function MetricCard({ title, value, detail }) {
  return (
    <Card>
      <div className="space-y-1">
        <p className="text-sm text-brand-mutedDark/70">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {detail && <p className="text-xs text-brand-mutedDark/60">{detail}</p>}
      </div>
    </Card>
  );
}

function DistributionList({ title, rows, labelKey, valueKey = 'count' }) {
  const normalized = normalizeRows(rows, labelKey, valueKey);
  const max = Math.max(...normalized.map(row => row.value), 1);

  return (
    <Card>
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      <div className="space-y-3">
        {normalized.length === 0 ? (
          <p className="text-sm text-brand-mutedDark/70">Sin datos disponibles.</p>
        ) : normalized.map(row => (
          <div key={row.label} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{row.label}</span>
              <span>{formatNumber(row.value)}</span>
            </div>
            <div className="h-2 bg-brand-primary/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-accent"
                style={{ width: `${Math.max(6, (row.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function SuperAdminPage() {
  const { isAuthenticated, profile, loading } = useAuth();
  const canLoadMetrics = isAuthenticated && profile?.role === 'superadmin';
  const { data: metrics, isLoading, isError, error, refetch } = useSuperAdminMetrics({
    enabled: canLoadMetrics,
  });
  const [guard, setGuard] = useState(false);
  const [activeView, setActiveView] = useState('metrics');

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        location.href = '/login';
      } else if (profile && profile.role !== 'superadmin') {
        location.href = profile.role === 'owner' ? '/admin' : '/shop';
      } else {
        setGuard(true);
      }
    }
  }, [isAuthenticated, loading, profile]);

  if (!guard) return null;

  const summary = metrics?.summary || {};

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Panel Superadmin</h1>
            <p className="text-sm text-brand-mutedDark/70">
              Métricas globales de negocios, clientes y preparación para análisis histórico.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={activeView === 'metrics' ? refetch : undefined}
              hidden={activeView !== 'metrics'}
              className="px-4 py-2 rounded-lg bg-brand-primary/30 hover:bg-brand-primary/50 font-semibold"
            >
              Actualizar
            </button>
            <button
              onClick={() => activeView === 'metrics' ? exportMetricsCsv(metrics) : exportHistoricalCsv()}
              disabled={activeView === 'metrics' && !metrics}
              className="px-4 py-2 rounded-lg bg-brand-accent text-white font-semibold hover:opacity-90 disabled:opacity-50"
            >
              Exportar {activeView === 'metrics' ? 'metricas' : 'analisis'}
            </button>
          </div>
        </div>

        <div className="flex border-b border-black/10" role="tablist" aria-label="Vistas del panel superadmin">
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'metrics'}
            onClick={() => setActiveView('metrics')}
            className={`border-b-2 px-4 py-3 text-sm font-semibold ${activeView === 'metrics' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-mutedDark/60'}`}
          >
            Metricas de ComeYa
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'historical'}
            onClick={() => setActiveView('historical')}
            className={`border-b-2 px-4 py-3 text-sm font-semibold ${activeView === 'historical' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-mutedDark/60'}`}
          >
            Analisis historico
          </button>
        </div>

        {activeView === 'historical' ? (
          <HistoricalAnalysisDashboard />
        ) : (
        <ApiLoading isLoading={isLoading} isError={isError} error={error} onRetry={refetch}>
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Clientes" value={formatNumber(summary.totalCustomers)} detail="Usuarios compradores" />
            <MetricCard title="Negocios" value={formatNumber(summary.totalBusinesses)} detail={`${formatNumber(summary.activeBusinesses)} activos`} />
            <MetricCard title="Pedidos" value={formatNumber(summary.totalOrders)} detail={`${formatNumber(summary.deliveredOrders)} entregados`} />
            <MetricCard title="Ventas entregadas" value={formatMoney(summary.totalSales)} detail="Solo pedidos entregados" />
            <MetricCard title="Productos activos" value={formatNumber(summary.activeProducts)} detail={`${formatNumber(summary.expiredProducts)} vencidos`} />
            <MetricCard title="Pedidos activos" value={formatNumber(summary.activeOrders)} detail="Pendientes o en proceso" />
            <MetricCard title="Comidas rescatadas" value={formatNumber(summary.mealsRescued)} detail={`${formatNumber(summary.co2Avoided)} kg CO2 evitado`} />
            <MetricCard title="Ahorro acumulado" value={formatMoney(summary.moneySaved)} detail="Ahorro de clientes" />
          </section>

          <section className="grid lg:grid-cols-3 gap-4">
            <DistributionList title="Pedidos por estado" rows={metrics?.ordersByStatus} labelKey="status" />
            <DistributionList title="Productos por categoria" rows={metrics?.productsByCategory} labelKey="category" />
            <DistributionList title="Negocios por distrito" rows={metrics?.businessesByDistrict} labelKey="district" />
          </section>

          <section className="grid lg:grid-cols-2 gap-4">
            <Card>
              <h2 className="text-lg font-bold mb-3">Ventas mensuales</h2>
              <div className="space-y-3">
                {(metrics?.monthlySales || []).length === 0 ? (
                  <p className="text-sm text-brand-mutedDark/70">Aún no hay ventas entregadas para comparar.</p>
                ) : metrics.monthlySales.map(row => (
                  <div key={row.period} className="flex items-center justify-between border-b border-black/5 pb-2 text-sm">
                    <span className="font-semibold">{row.period}</span>
                    <span>{formatNumber(row.orders)} pedidos · {formatMoney(row.sales)}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-bold mb-3">Analisis historico</h2>
              <div className="space-y-3 text-sm text-brand-mutedDark/80">
                <p>La prueba de concepto con datos externos ya esta disponible en la pestaña de analisis historico.</p>
                <button type="button" onClick={() => setActiveView('historical')} className="font-semibold text-brand-accent underline underline-offset-2">
                  Ver resultados del modelo
                </button>
              </div>
            </Card>
          </section>
        </ApiLoading>
        )}
      </main>
    </div>
  );
}
