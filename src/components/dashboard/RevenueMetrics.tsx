import React from 'react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import './RevenueMetrics.css';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, icon }) => {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <p className="metric-title">{title}</p>
        <h3 className="metric-value">{value}</h3>
        {trend && (
          <div className={`metric-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              {trend.isPositive ? (
                <path d="M10 4L16 10L10 16V11H4V9H10V4Z" fill="currentColor" transform="rotate(-90 10 10)" />
              ) : (
                <path d="M10 4L16 10L10 16V11H4V9H10V4Z" fill="currentColor" transform="rotate(90 10 10)" />
              )}
            </svg>
            <span>{formatPercentage(Math.abs(trend.value))} vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface RevenueMetricsProps {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
}

const RevenueMetrics: React.FC<RevenueMetricsProps> = ({
  totalRevenue,
  monthlyRevenue,
  activeSubscriptions,
  churnRate,
}) => {
  return (
    <div className="revenue-metrics">
      <MetricCard
        title="Total Revenue"
        value={formatCurrency(totalRevenue)}
        trend={{ value: 12.5, isPositive: true }}
        icon={
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        }
      />
      <MetricCard
        title="Monthly Recurring Revenue"
        value={formatCurrency(monthlyRevenue)}
        trend={{ value: 8.2, isPositive: true }}
        icon={
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        }
      />
      <MetricCard
        title="Active Subscriptions"
        value={activeSubscriptions.toString()}
        trend={{ value: 5.3, isPositive: true }}
        icon={
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        }
      />
      <MetricCard
        title="Churn Rate"
        value={formatPercentage(churnRate)}
        trend={{ value: 2.1, isPositive: false }}
        icon={
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8A6 6 0 0 0 6 8C6 11 2 13 2 13M2 13L5 10M2 13L5 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 16A6 6 0 0 0 18 16C18 13 22 11 22 11M22 11L19 8M22 11L19 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        }
      />
    </div>
  );
};

export default RevenueMetrics;
