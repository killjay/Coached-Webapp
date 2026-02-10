import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import RevenueMetrics from '../../components/dashboard/RevenueMetrics';
import RevenueChart from '../../components/dashboard/RevenueChart';
import PaymentStatus from '../../components/dashboard/PaymentStatus';
import { 
  MOCK_REVENUE_METRICS, 
  MOCK_CHART_DATA, 
  MOCK_REVENUE_BY_PLAN, 
  MOCK_PAYMENTS,
  DASHBOARD_LABELS 
} from '../../constants';
import './RevenueDashboard.css';

const RevenueDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('30');

  // Mock data - in production, this would come from Firestore
  const metrics = MOCK_REVENUE_METRICS;
  const chartData = MOCK_CHART_DATA as any;
  const payments = MOCK_PAYMENTS as any;

  const handleExport = () => {
    // Export to CSV logic
    const csv = [
      ['Client', 'Plan', 'Amount', 'Due Date', 'Status'],
      ...payments.map((p: any) => [p.clientName, p.plan, p.amount, p.dueDate, p.status]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="revenue-dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{DASHBOARD_LABELS.REVENUE.TITLE}</h1>
          <p className="page-description">{DASHBOARD_LABELS.REVENUE.DESCRIPTION}</p>
        </div>
        <div className="page-actions">
          <Select
            options={DASHBOARD_LABELS.DATE_RANGES as any}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          />
          <Button variant="primary" onClick={handleExport}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {DASHBOARD_LABELS.REVENUE.EXPORT_BUTTON}
          </Button>
        </div>
      </div>

      <RevenueMetrics
        totalRevenue={metrics.totalRevenue}
        monthlyRevenue={metrics.monthlyRevenue}
        activeSubscriptions={metrics.activeSubscriptions}
        churnRate={metrics.churnRate}
      />

      <div className="revenue-grid">
        <Card title={DASHBOARD_LABELS.REVENUE.REVENUE_TREND} subtitle={DASHBOARD_LABELS.REVENUE.REVENUE_TREND_SUBTITLE}>
          <RevenueChart data={chartData} />
        </Card>

        <Card title={DASHBOARD_LABELS.REVENUE.REVENUE_BY_PLAN} className="revenue-breakdown">
          <div className="breakdown-list">
            {MOCK_REVENUE_BY_PLAN.map((item) => (
              <div key={item.plan} className="breakdown-item">
                <div className="breakdown-label">
                  <span className="breakdown-dot" style={{ background: item.color }}></span>
                  {item.plan}
                </div>
                <div className="breakdown-value">${item.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title={DASHBOARD_LABELS.REVENUE.PAYMENT_STATUS} subtitle={DASHBOARD_LABELS.REVENUE.PAYMENT_STATUS_SUBTITLE}>
        <PaymentStatus payments={payments} />
      </Card>
    </div>
  );
};

export default RevenueDashboard;
