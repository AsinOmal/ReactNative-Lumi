import React from 'react';
import { DollarSign } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useRevenue, PRODUCT_LABELS, PRODUCT_PRICES } from '../../hooks/useRevenue';
import './RevenueScreen.css';

const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatRevenue = (productId: string, count: number): string => {
  const price = PRODUCT_PRICES[productId];
  if (!price) return '—';
  return `$${(price * count).toFixed(2)}`;
};

export const RevenueScreen: React.FC = () => {
  const { stats, loading } = useRevenue();

  const totalRevenue = Object.entries(stats.byProduct).reduce((sum, [id, count]) => {
    return sum + (PRODUCT_PRICES[id] ?? 0) * count;
  }, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="revenue">
      <PageHeader
        title="Revenue"
        subtitle="In-app purchase overview — Phase 11 (IAP) required to populate"
      />

      <div className="revenue__kpis">
        <div className="revenue__kpi">
          <span className="revenue__kpi-value">{stats.totalPurchases}</span>
          <span className="revenue__kpi-label">Total Purchases</span>
        </div>
        <div className="revenue__kpi revenue__kpi--accent">
          <span className="revenue__kpi-value">${totalRevenue.toFixed(2)}</span>
          <span className="revenue__kpi-label">Estimated Revenue</span>
        </div>
      </div>

      <div className="revenue__card">
        <h2 className="revenue__section-title">By Product</h2>
        {Object.keys(stats.byProduct).length === 0 ? (
          <p className="revenue__empty">No purchases recorded yet.</p>
        ) : (
          <table className="revenue__table">
            <thead>
              <tr><th>Product</th><th>Purchases</th><th>Price</th><th>Revenue</th></tr>
            </thead>
            <tbody>
              {Object.entries(stats.byProduct).map(([id, count]) => (
                <tr key={id} className="revenue__row">
                  <td className="revenue__product">{PRODUCT_LABELS[id] ?? id}</td>
                  <td>{count}</td>
                  <td>${(PRODUCT_PRICES[id] ?? 0).toFixed(2)}</td>
                  <td className="revenue__total">{formatRevenue(id, count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="revenue__card">
        <h2 className="revenue__section-title">Recent Purchases</h2>
        {stats.recentPurchases.length === 0 ? (
          <EmptyState
            icon={<DollarSign size={40} />}
            title="No purchases yet"
            description="Purchases appear here once Phase 11 (IAP) is live."
          />
        ) : (
          <table className="revenue__table">
            <thead>
              <tr><th>Product</th><th>User UID</th><th>Date</th><th>Type</th></tr>
            </thead>
            <tbody>
              {stats.recentPurchases.map((p, i) => (
                <tr key={i} className="revenue__row">
                  <td>{PRODUCT_LABELS[p.productId] ?? p.productId}</td>
                  <td className="revenue__uid">{p.uid}</td>
                  <td>{fmt(p.purchasedAt)}</td>
                  <td>{p.simulated ? <span className="revenue__badge">Simulated</span> : 'Real'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
