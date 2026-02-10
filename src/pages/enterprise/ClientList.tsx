import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table, { Column } from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { useTable } from '../../hooks/useTable';
import { formatDate } from '../../utils/dateUtils';
import { MOCK_CLIENTS } from '../../constants';
import './ClientList.css';

interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  assignedCoach: string;
  status: 'active' | 'inactive' | 'paused';
  planType: string;
  joinDate: string;
  lastSession: string;
}

const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Mock data - replace with Firestore data in production
  const mockClients: Client[] = MOCK_CLIENTS as any;

  const table = useTable({
    data: mockClients,
    initialPageSize: 10,
    initialSortKey: 'fullName',
  });

  const columns: Column<Client>[] = [
    {
      key: 'fullName',
      header: 'Name',
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'assignedCoach',
      header: 'Coach',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (client) => (
        <span className={`status-badge status-${client.status}`}>
          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'planType',
      header: 'Plan',
      sortable: true,
    },
    {
      key: 'joinDate',
      header: 'Join Date',
      render: (client) => formatDate(client.joinDate),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (client) => (
        <Button
          size="small"
          variant="ghost"
          onClick={() => {
            setSelectedClient(client);
            setShowModal(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="client-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Client List</h1>
          <p className="page-description">View and manage all clients</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/enterprise/client-onboard')}>
          + Add Client
        </Button>
      </div>

      <Card>
        <div className="list-filters">
          <Input
            placeholder="Search clients..."
            value={table.searchQuery}
            onChange={(e) => table.handleSearch(e.target.value)}
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            }
          />
          <Select
            options={[
              { value: '', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'paused', label: 'Paused' },
            ]}
            value={table.filters.status as string || ''}
            onChange={(e) => table.handleFilter('status', e.target.value || undefined)}
          />
          <Select
            options={[
              { value: '', label: 'All Plans' },
              { value: 'Premium', label: 'Premium' },
              { value: 'Standard', label: 'Standard' },
              { value: 'Basic', label: 'Basic' },
            ]}
            value={table.filters.planType as string || ''}
            onChange={(e) => table.handleFilter('planType', e.target.value || undefined)}
          />
        </div>

        {table.data.length === 0 ? (
          <EmptyState
            title="No clients found"
            description="Get started by adding your first client"
            action={{
              label: 'Add Client',
              onClick: () => navigate('/enterprise/client-onboard'),
            }}
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={table.data}
              keyExtractor={(client) => client.id}
            />
            <div className="table-pagination">
              <div className="pagination-info">
                Showing {((table.currentPage - 1) * table.pageSize) + 1} to{' '}
                {Math.min(table.currentPage * table.pageSize, table.totalItems)} of{' '}
                {table.totalItems} results
              </div>
              <div className="pagination-controls">
                <Button
                  size="small"
                  variant="secondary"
                  disabled={table.currentPage === 1}
                  onClick={() => table.handlePageChange(table.currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="page-number">
                  Page {table.currentPage} of {table.totalPages}
                </span>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={table.currentPage === table.totalPages}
                  onClick={() => table.handlePageChange(table.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Client Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Client Details"
        size="large"
      >
        {selectedClient && (
          <div className="client-detail">
            <div className="detail-section">
              <h4>Personal Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">{selectedClient.fullName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedClient.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{selectedClient.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge status-${selectedClient.status}`}>
                    {selectedClient.status.charAt(0).toUpperCase() + selectedClient.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h4>Subscription</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Plan</span>
                  <span className="detail-value">{selectedClient.planType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Assigned Coach</span>
                  <span className="detail-value">{selectedClient.assignedCoach}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Join Date</span>
                  <span className="detail-value">{formatDate(selectedClient.joinDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Session</span>
                  <span className="detail-value">{formatDate(selectedClient.lastSession)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClientList;
