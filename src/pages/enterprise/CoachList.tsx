import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table, { Column } from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { useTable } from '../../hooks/useTable';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { CoachProfile } from '../../types';
import '../enterprise/ClientList.css';

interface Coach {
  id: string;
  fullName: string;
  email: string;
  specializations: string[];
  status: 'pending' | 'verified' | 'rejected' | 'active' | 'inactive';
  clientCount: number;
  revenue: number;
  joinDate: string;
}

const CoachList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [coachesLoading, setCoachesLoading] = useState(true);
  const [coachesError, setCoachesError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'coach_profiles'));

    setCoachesError(null);
    setCoachesLoading(true);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows: Coach[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Partial<CoachProfile> & {
            createdAt?: any;
            metrics?: any;
          };

          const createdAt = data.createdAt;
          const joinDate =
            createdAt && typeof createdAt.toDate === 'function'
              ? createdAt.toDate().toISOString()
              : createdAt instanceof Date
                ? createdAt.toISOString()
                : typeof createdAt === 'string'
                  ? createdAt
                  : '';

          const metrics = data.metrics ?? {};
          const clientCount = typeof metrics.clientCount === 'number' ? metrics.clientCount : 0;
          const revenue = typeof metrics.totalRevenue === 'number' ? metrics.totalRevenue : 0;

          return {
            id: docSnap.id,
            fullName: data.fullName || '(No name)',
            email: data.email || '',
            specializations: Array.isArray(data.specializations) ? data.specializations : [],
            status: (data.status as Coach['status']) || 'pending',
            clientCount,
            revenue,
            joinDate,
          };
        });

        setCoaches(rows);
        setCoachesLoading(false);
      },
      (error) => {
        console.error('Error loading coaches:', error);
        setCoaches([]);
        setCoachesError('Failed to load coaches. Please refresh and try again.');
        setCoachesLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const table = useTable({
    data: coaches,
    initialPageSize: 10,
    initialSortKey: 'fullName',
  });

  const columns: Column<Coach>[] = useMemo(
    () => [
      {
        key: 'fullName',
        header: 'Name',
        sortable: true,
      },
      {
        key: 'specializations',
        header: 'Specializations',
        render: (coach) => coach.specializations.join(', '),
      },
      {
        key: 'clientCount',
        header: 'Clients',
        sortable: true,
      },
      {
        key: 'revenue',
        header: 'Revenue',
        render: (coach) => formatCurrency(coach.revenue),
        sortable: true,
      },
      {
        key: 'status',
        header: 'Status',
        render: (coach) => (
          <span className={`status-badge status-${coach.status}`}>
            {coach.status.charAt(0).toUpperCase() + coach.status.slice(1)}
          </span>
        ),
        sortable: true,
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (coach) => (
          <Button
            size="small"
            variant="ghost"
            onClick={() => {
              setSelectedCoach(coach);
              setShowModal(true);
            }}
          >
            View
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="client-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Coach List</h1>
        </div>
        <Button variant="primary" onClick={() => navigate('/enterprise/coach-onboard')}>
          + Add Coach
        </Button>
      </div>

      <Card>
        <div className="list-filters">
          <Input
            placeholder="Search coaches..."
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
              { value: 'verified', label: 'Verified' },
              { value: 'pending', label: 'Pending' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'rejected', label: 'Rejected' },
            ]}
            value={table.filters.status as string || ''}
            onChange={(e) => table.handleFilter('status', e.target.value || undefined)}
          />
        </div>

        {coachesLoading && <div className="loading-state">Loading...</div>}
        {coachesError && <div style={{ color: '#ef4444' }}>{coachesError}</div>}
        {!coachesLoading && !coachesError && coaches.length === 0 && (
          <div className="empty-state">No coaches found.</div>
        )}

        <Table
          columns={columns}
          data={table.data}
          keyExtractor={(coach) => coach.id}
        />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Coach Details"
        size="large"
      >
        {selectedCoach && (
          <div className="client-detail">
            <div className="detail-section">
              <h4>Coach Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">{selectedCoach.fullName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedCoach.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge status-${selectedCoach.status}`}>
                    {selectedCoach.status.charAt(0).toUpperCase() + selectedCoach.status.slice(1)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Join Date</span>
                  <span className="detail-value">
                    {selectedCoach.joinDate ? formatDate(selectedCoach.joinDate) : '—'}
                  </span>
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h4>Performance Metrics</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Total Clients</span>
                  <span className="detail-value">{selectedCoach.clientCount}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Revenue</span>
                  <span className="detail-value">{formatCurrency(selectedCoach.revenue)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Specializations</span>
                  <span className="detail-value">
                    {selectedCoach.specializations.length > 0 ? selectedCoach.specializations.join(', ') : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CoachList;
