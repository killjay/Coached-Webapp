import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { UI_MESSAGES } from '../../constants';

interface Appointment {
  id: string;
  title: string;
  client: string;
  coach: string;
  date: string;
  time: string;
  type: string;
}

const Calendar: React.FC = () => {
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [showModal, setShowModal] = useState(false);
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);

  const mockAppointments: Appointment[] = [
    {
      id: '1',
      title: 'Training Session',
      client: 'John Smith',
      coach: 'Sarah Williams',
      date: '2026-02-10',
      time: '10:00 AM',
      type: 'Training',
    },
    {
      id: '2',
      title: 'Consultation',
      client: 'Emily Johnson',
      coach: 'Mike Davis',
      date: '2026-02-10',
      time: '2:00 PM',
      type: 'Consultation',
    },
  ];

  const todayAppointments = mockAppointments.filter(apt => apt.date === selectedDate);

  return (
    <div className="calendar-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-description">Manage appointments and scheduling</p>
        </div>
        <div className="page-actions">
          <Select
            options={[
              { value: 'month', label: 'Month' },
              { value: 'week', label: 'Week' },
              { value: 'day', label: 'Day' },
            ]}
            value={view}
            onChange={(e) => setView(e.target.value as any)}
          />
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + New Appointment
          </Button>
        </div>
      </div>

      <div className="calendar-grid">
        <Card title={`Appointments - ${selectedDate}`}>
          {todayAppointments.length === 0 ? (
            <div className="empty-calendar">
              <p>No appointments scheduled for this date</p>
            </div>
          ) : (
            <div className="appointments-list">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="appointment-card">
                  <div className="appointment-time">{apt.time}</div>
                  <div className="appointment-details">
                    <h4>{apt.title}</h4>
                    <p>Client: {apt.client}</p>
                    <p>Coach: {apt.coach}</p>
                    <span className="appointment-type">{apt.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Appointment"
        size="medium"
      >
        <div className="appointment-form">
          <Select
            label="Client"
            options={[
              { value: '1', label: 'John Smith' },
              { value: '2', label: 'Emily Johnson' },
            ]}
          />
          <Select
            label="Coach"
            options={[
              { value: '1', label: 'Sarah Williams' },
              { value: '2', label: 'Mike Davis' },
            ]}
          />
          <Input label="Date" type="date" />
          <Input label="Time" type="time" />
          <Select
            label="Type"
            options={[
              { value: 'training', label: 'Training' },
              { value: 'consultation', label: 'Consultation' },
              { value: 'assessment', label: 'Assessment' },
            ]}
          />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => { alert(UI_MESSAGES.APPOINTMENT.SUCCESS); setShowModal(false); }}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Calendar;
