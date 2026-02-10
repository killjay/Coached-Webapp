import React from 'react';
import Table, { Column } from '../common/Table';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import './PaymentStatus.css';

interface Payment {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  plan: string;
}

interface PaymentStatusProps {
  payments: Payment[];
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ payments }) => {
  const columns: Column<Payment>[] = [
    {
      key: 'clientName',
      header: 'Client',
      sortable: true,
    },
    {
      key: 'plan',
      header: 'Plan',
      sortable: true,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (payment) => formatCurrency(payment.amount),
      sortable: true,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (payment) => formatDate(payment.dueDate),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (payment) => (
        <span className={`payment-status-badge status-${payment.status}`}>
          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="payment-status-table">
      <Table
        columns={columns}
        data={payments}
        keyExtractor={(payment) => payment.id}
        emptyMessage="No payments to display"
      />
    </div>
  );
};

export default PaymentStatus;
