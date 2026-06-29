export const historicalAnalysis = {
  source: {
    name: 'Retail Sales Forecasting Data',
    provider: 'Kaggle',
    url: 'https://www.kaggle.com/datasets/svizor/retail-sales-forecasting-data',
    period: '25 meses',
  },
  kpis: {
    datasetRows: 7423481,
    products: 28167,
    stores: 4,
    recommendations: 58000,
    mae: 2.6779638308,
    rmse: 33.6964392124,
    mape: 73.2256516583,
    r2: 0.3615521857,
  },
  models: [
    { name: 'Promedio historico', mae: 3.3964912401, rmse: 36.077056964, mape: 94.3713676762, r2: 0.2681541943 },
    { name: 'HistGradientBoosting', mae: 2.6779638308, rmse: 33.6964392124, mape: 73.2256516583, r2: 0.3615521857 },
  ],
  monthlySales: [
    ['2022-08', 161881.63], ['2022-09', 1260323.06], ['2022-10', 1306230.64],
    ['2022-11', 1253703.01], ['2022-12', 1385923.75], ['2023-01', 1165107.06],
    ['2023-02', 1144887.44], ['2023-03', 1317830.73], ['2023-04', 1292495.47],
    ['2023-05', 1299626.19], ['2023-06', 1256938.20], ['2023-07', 1283189.15],
    ['2023-08', 1280218.97], ['2023-09', 1280217.52], ['2023-10', 1280015.91],
    ['2023-11', 1257405.81], ['2023-12', 2100330.19], ['2024-01', 1983648.33],
    ['2024-02', 2085699.32], ['2024-03', 2400650.89], ['2024-04', 2363505.95],
    ['2024-05', 2456612.53], ['2024-06', 2327062.95], ['2024-07', 2449537.98],
    ['2024-08', 2402494.35], ['2024-09', 2146022.31],
  ].map(([period, quantity]) => ({ period, quantity })),
  weekdaySales: [
    ['Lun', 5450178.79], ['Mar', 5604900.08], ['Mie', 5794614.23],
    ['Jue', 6195858.16], ['Vie', 7206493.50], ['Sab', 6386840.93], ['Dom', 5302673.63],
  ].map(([day, quantity]) => ({ day, quantity })),
  storeSales: [
    ['Tienda 1', 23071212.07], ['Tienda 4', 9219441.65],
    ['Tienda 2', 4897016.34], ['Tienda 3', 4753889.28],
  ].map(([store, quantity]) => ({ store, quantity })),
  recommendationDiscounts: [
    [20, 12747], [25, 13779], [30, 12738], [35, 5892], [40, 12844],
  ].map(([discount, recommendations]) => ({ discount, recommendations })),
  recommendationDemand: [
    ['Alta', 19140, 22.44], ['Media', 19718, 31.15], ['Baja', 19142, 34.37],
  ].map(([level, recommendations, averageDiscount]) => ({ level, recommendations, averageDiscount })),
  methodology: [
    'Procesamiento de archivos grandes con DuckDB y uniones tipo left join.',
    'Division temporal: datos antiguos para entrenamiento y recientes para prueba.',
    'Promedios moviles de 7 y 30 dias calculados solo con dias anteriores.',
    'Pipeline con variables categoricas y HistGradientBoostingRegressor.',
  ],
  limitations: [
    'Los datos son externos y no pertenecen a ComeYa.',
    'El vencimiento fue simulado a partir del descuento; no representa caducidad real.',
    'La relacion entre promociones, descuentos y ventas es descriptiva, no causal.',
    'No existen costos reales para estimar margen o rentabilidad.',
    'El modelo tiene capacidad predictiva moderada y no esta listo para produccion.',
    'Las recomendaciones son orientativas y requieren validacion humana.',
  ],
};
