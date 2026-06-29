'use client';

import Card from '@/components/Card';
import { historicalAnalysis as data } from '@/lib/data/historical-analysis';

const numberFormatter = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });

function formatNumber(value) {
  return numberFormatter.format(Number(value || 0));
}

function HistoricalKpi({ label, value, detail }) {
  return (
    <Card>
      <p className="text-sm text-brand-mutedDark/70">{label}</p>
      <p className="mt-1 text-2xl font-bold text-brand-mutedDark">{value}</p>
      <p className="mt-1 text-xs text-brand-mutedDark/60">{detail}</p>
    </Card>
  );
}

function LineChart({ rows }) {
  const width = 900;
  const height = 260;
  const padding = 28;
  const values = rows.map(row => row.quantity);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = rows.map((row, index) => {
    const x = padding + (index / Math.max(rows.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((row.quantity - min) / range) * (height - padding * 2);
    return { ...row, x, y };
  });

  return (
    <div>
      <div className="h-64 w-full" role="img" aria-label="Serie mensual de unidades vendidas entre agosto de 2022 y septiembre de 2024">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
          {[0, 1, 2, 3].map(line => {
            const y = padding + line * ((height - padding * 2) / 3);
            return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} stroke="currentColor" className="text-black/10" />;
          })}
          <polyline
            points={points.map(point => `${point.x},${point.y}`).join(' ')}
            fill="none"
            stroke="#c84b31"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {points.map(point => (
            <circle key={point.period} cx={point.x} cy={point.y} r="4" fill="#c84b31">
              <title>{point.period}: {formatNumber(point.quantity)} unidades</title>
            </circle>
          ))}
        </svg>
      </div>
      <div className="flex justify-between text-xs text-brand-mutedDark/60">
        <span>{rows[0]?.period}</span>
        <span>{rows[Math.floor(rows.length / 2)]?.period}</span>
        <span>{rows.at(-1)?.period}</span>
      </div>
    </div>
  );
}

function BarChart({ rows, labelKey, valueKey, valueLabel = formatNumber, color = 'bg-brand-accent' }) {
  const max = Math.max(...rows.map(row => row[valueKey]), 1);

  return (
    <div className="space-y-3">
      {rows.map(row => (
        <div key={row[labelKey]} className="grid grid-cols-[72px_minmax(0,1fr)_92px] items-center gap-3 text-sm">
          <span className="font-semibold">{row[labelKey]}</span>
          <div className="h-3 overflow-hidden rounded bg-black/5">
            <div className={`h-full ${color}`} style={{ width: `${Math.max(3, (row[valueKey] / max) * 100)}%` }} />
          </div>
          <span className="text-right text-brand-mutedDark/70">{valueLabel(row[valueKey])}</span>
        </div>
      ))}
    </div>
  );
}

function ModelComparison() {
  const metrics = [
    ['MAE', 'mae', false],
    ['RMSE', 'rmse', false],
    ['MAPE', 'mape', false],
    ['R2', 'r2', true],
  ];

  return (
    <div className="space-y-5">
      {metrics.map(([label, key, higherIsBetter]) => {
        const values = data.models.map(model => model[key]);
        const max = Math.max(...values, 1);
        return (
          <div key={key}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-bold">{label}</span>
              <span className="text-xs text-brand-mutedDark/60">{higherIsBetter ? 'Mayor es mejor' : 'Menor es mejor'}</span>
            </div>
            <div className="space-y-2">
              {data.models.map((model, index) => (
                <div key={model.name} className="grid grid-cols-[126px_minmax(0,1fr)_62px] items-center gap-2 text-xs">
                  <span>{model.name}</span>
                  <div className="h-3 overflow-hidden rounded bg-black/5">
                    <div
                      className={`h-full ${index === 1 ? 'bg-brand-accent' : 'bg-brand-primary'}`}
                      style={{ width: `${(model[key] / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-right font-semibold">{model[key].toFixed(key === 'r2' ? 3 : 2)}{key === 'mape' ? '%' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function exportHistoricalCsv() {
  const rows = [
    ['Seccion', 'Elemento', 'Valor'],
    ['Dataset', 'Observaciones', data.kpis.datasetRows],
    ['Dataset', 'Productos', data.kpis.products],
    ['Dataset', 'Tiendas', data.kpis.stores],
    ['Modelo', 'MAE', data.kpis.mae],
    ['Modelo', 'RMSE', data.kpis.rmse],
    ['Modelo', 'MAPE', data.kpis.mape],
    ['Modelo', 'R2', data.kpis.r2],
    ...data.monthlySales.map(row => ['Ventas mensuales', row.period, row.quantity]),
    ...data.weekdaySales.map(row => ['Ventas por dia', row.day, row.quantity]),
    ...data.storeSales.map(row => ['Ventas por tienda', row.store, row.quantity]),
    ...data.recommendationDiscounts.map(row => ['Recomendaciones', `${row.discount}%`, row.recommendations]),
  ];
  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `comeya-analisis-historico-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function HistoricalAnalysisDashboard() {
  return (
    <div className="space-y-6">
      <section className="border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-bold">Prueba de concepto academica</p>
        <p className="mt-1">Estos resultados usan datos externos y vencimientos simulados. No representan operaciones reales de ComeYa ni decisiones automaticas de precio.</p>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <HistoricalKpi label="Observaciones" value={formatNumber(data.kpis.datasetRows)} detail={data.source.period + ' de ventas'} />
        <HistoricalKpi label="Productos" value={formatNumber(data.kpis.products)} detail={`${data.kpis.stores} tiendas analizadas`} />
        <HistoricalKpi label="MAE" value={data.kpis.mae.toFixed(4)} detail="Error absoluto medio" />
        <HistoricalKpi label="R2" value={data.kpis.r2.toFixed(4)} detail="Capacidad predictiva moderada" />
      </section>

      <section className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">Evolucion mensual de ventas</h2>
              <p className="text-xs text-brand-mutedDark/60">Cantidad agregada vendida; no son ingresos de ComeYa.</p>
            </div>
            <span className="rounded bg-brand-accent/10 px-2 py-1 text-xs font-semibold text-brand-accent">Ago 2022 - Sep 2024</span>
          </div>
          <LineChart rows={data.monthlySales} />
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold">Comparacion de modelos</h2>
          <p className="mb-5 text-xs text-brand-mutedDark/60">Prueba temporal sobre 200,000 observaciones recientes.</p>
          <ModelComparison />
        </Card>
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-lg font-bold">Ventas por dia de semana</h2>
          <p className="mb-5 text-xs text-brand-mutedDark/60">El viernes concentra el mayor volumen observado.</p>
          <BarChart rows={data.weekdaySales} labelKey="day" valueKey="quantity" />
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Volumen por tienda</h2>
          <p className="mb-5 text-xs text-brand-mutedDark/60">Distribucion del dataset externo entre cuatro establecimientos.</p>
          <BarChart rows={data.storeSales} labelKey="store" valueKey="quantity" color="bg-brand-primary" />
        </Card>
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-lg font-bold">Descuentos sugeridos</h2>
          <p className="mb-5 text-xs text-brand-mutedDark/60">Distribucion de 58,000 recomendaciones orientativas.</p>
          <BarChart
            rows={data.recommendationDiscounts}
            labelKey="discount"
            valueKey="recommendations"
            valueLabel={formatNumber}
          />
          <div className="mt-3 flex justify-between pl-[75px] text-xs text-brand-mutedDark/50">
            <span>Las etiquetas representan porcentaje de descuento.</span>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Demanda estimada</h2>
          <p className="mb-5 text-xs text-brand-mutedDark/60">Cantidad de recomendaciones y descuento promedio por nivel.</p>
          <div className="grid grid-cols-3 gap-3">
            {data.recommendationDemand.map(row => (
              <div key={row.level} className="border-t-4 border-brand-accent bg-black/[0.025] p-3">
                <p className="text-sm font-bold">{row.level}</p>
                <p className="mt-2 text-xl font-bold">{formatNumber(row.recommendations)}</p>
                <p className="mt-1 text-xs text-brand-mutedDark/60">{row.averageDiscount.toFixed(1)}% desc. promedio</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-lg font-bold">Metodologia aplicada</h2>
          <ol className="mt-3 space-y-3 text-sm text-brand-mutedDark/80">
            {data.methodology.map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-brand-primary/30 text-xs font-bold">{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Alcance y limitaciones</h2>
          <ul className="mt-3 space-y-2 text-sm text-brand-mutedDark/80">
            {data.limitations.map(item => (
              <li key={item} className="border-l-2 border-amber-400 pl-3">{item}</li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="border-t border-black/10 pt-4 text-sm text-brand-mutedDark/70">
        <p>
          Fuente: <a href={data.source.url} target="_blank" rel="noreferrer" className="font-semibold text-brand-accent underline underline-offset-2">{data.source.name} en {data.source.provider}</a>.
          Cuando ComeYa acumule historial suficiente, este conjunto sera reemplazado por datos de products, orders y order_items.
        </p>
      </section>
    </div>
  );
}
