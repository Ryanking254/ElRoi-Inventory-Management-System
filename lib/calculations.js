export function getLowStockItems(items) {
  return items.filter((item) => item.currentStock <= item.lowStockThreshold);
}

export function getTodayStats(movements) {
  const today = new Date().toISOString().slice(0, 10);
  const todayMoves = movements.filter((m) => (m.date || '').startsWith(today) && m.type === 'SALE');
  const revenue = todayMoves.reduce((sum, m) => sum + (m.totalRevenue || 0), 0);
  const profit = todayMoves.reduce((sum, m) => sum + (m.profit || 0), 0);
  const salesCount = todayMoves.length;
  return { revenue, profit, salesCount };
}

export function getTotalStockValue(items) {
  return items.reduce((sum, item) => sum + item.currentStock * item.costPrice, 0);
}

export function getTotalItems(items) {
  return items.reduce((sum, item) => sum + item.currentStock, 0);
}

export function formatCurrency(amount, currency = 'KES') {
  const symbols = { KES: 'KSh', GBP: '£', USD: '$' };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${Number(amount || 0).toFixed(2)}`;
}

export function getProfitMargin(revenue, cost) {
  if (!revenue) return 0;
  return ((revenue - cost) / revenue) * 100;
}
