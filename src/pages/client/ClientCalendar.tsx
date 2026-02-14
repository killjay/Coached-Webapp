import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Select from '../../components/common/Select';
import '../../pages/enterprise/Calendar.css';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { Appointment, ClientProfile } from '../../types';
import {
  format,
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  addWeeks,
} from 'date-fns';

function formatAppointmentChip(apt: Appointment): string {
  const startTime: any = (apt as any)?.startTime;
  const start =
    startTime && typeof startTime.toDate === 'function'
      ? startTime.toDate()
      : startTime instanceof Date
        ? startTime
        : null;
  const timePart = start ? format(start, 'h:mm a') : '';
  const typePart = apt.type ? String(apt.type).replace('_', ' ') : 'meeting';
  return `${timePart ? `${timePart} ` : ''}${typePart}`;
}

type DayChip = {
  key: string;
  kind: 'meeting';
  label: string;
  color?: string;
};

const ClientCalendar: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [monthCursor, setMonthCursor] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [clientId, setClientId] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  const monthTitle = useMemo(() => {
    if (view === 'day') {
      return format(selectedDate, 'EEEE, MMMM d, yyyy');
    }
    if (view === 'week') {
      const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    return format(monthCursor, 'MMMM yyyy');
  }, [monthCursor, selectedDate, view]);

  const selectedDateLabel = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);

  const calendarDays = useMemo(() => {
    if (view === 'day') {
      return [selectedDate];
    }
    
    if (view === 'week') {
      const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        days.push(addDays(start, i));
      }
      return days;
    }
    
    // month view
    const start = startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(monthCursor), { weekStartsOn: 0 });
    const days: Date[] = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [view, selectedDate, monthCursor]);

  // Find client ID by email
  useEffect(() => {
    if (!user?.email) return;

    const q = query(collection(db, 'client_profiles'), where('email', '==', user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setClientId(snapshot.docs[0].id);
      }
    });

    return unsubscribe;
  }, [user]);

  // Load appointments for this client
  useEffect(() => {
    if (!clientId) return;

    setAppointmentsError(null);
    setAppointmentsLoading(true);
    
    const startDate = startOfDay(calendarDays[0]);
    const endDate = addDays(startOfDay(calendarDays[calendarDays.length - 1]), 1);

    const appointmentQuery = query(
      collection(db, 'appointments'),
      where('clientId', '==', clientId)
    );

    const unsubscribe = onSnapshot(
      appointmentQuery,
      (snapshot) => {
        const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Appointment[];
        
        // Filter by date range
        const filteredRows = rows.filter((apt) => {
          const st: any = (apt as any).startTime;
          const aptDate =
            st && typeof st.toDate === 'function'
              ? st.toDate()
              : st instanceof Date
                ? st
                : null;
          if (!aptDate) return false;
          return aptDate >= startDate && aptDate < endDate;
        });
        
        setAppointments(filteredRows);
        setAppointmentsLoading(false);
      },
      (err) => {
        console.error('Error loading appointments:', err);
        setAppointmentsError('Failed to load appointments.');
        setAppointmentsLoading(false);
      }
    );

    return unsubscribe;
  }, [clientId, calendarDays]);

  const appointmentsByDayKey = useMemo(() => {
    const map = new Map<string, number>();
    appointments.forEach((apt) => {
      const st: any = (apt as any).startTime;
      const date =
        st && typeof st.toDate === 'function'
          ? st.toDate()
          : st instanceof Date
            ? st
            : null;
      if (!date) return;
      const key = format(date, 'yyyy-MM-dd');
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [appointments]);

  const appointmentsListByDayKey = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((apt) => {
      const st: any = (apt as any).startTime;
      const date =
        st && typeof st.toDate === 'function'
          ? st.toDate()
          : st instanceof Date
            ? st
            : null;
      if (!date) return;
      const key = format(date, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    });
    return map;
  }, [appointments]);

  function handleSelectDay(day: Date): void {
    setSelectedDate(day);
    if (view === 'month' && !isSameMonth(day, monthCursor)) {
      setMonthCursor(day);
    }
  }

  function handlePrev(): void {
    if (view === 'month') {
      setMonthCursor(addMonths(monthCursor, -1));
    } else if (view === 'week') {
      const newDate = addWeeks(selectedDate, -1);
      setSelectedDate(newDate);
      if (!isSameMonth(newDate, monthCursor)) {
        setMonthCursor(newDate);
      }
    } else {
      const newDate = addDays(selectedDate, -1);
      setSelectedDate(newDate);
      if (!isSameMonth(newDate, monthCursor)) {
        setMonthCursor(newDate);
      }
    }
  }

  function handleNext(): void {
    if (view === 'month') {
      setMonthCursor(addMonths(monthCursor, 1));
    } else if (view === 'week') {
      const newDate = addWeeks(selectedDate, 1);
      setSelectedDate(newDate);
      if (!isSameMonth(newDate, monthCursor)) {
        setMonthCursor(newDate);
      }
    } else {
      const newDate = addDays(selectedDate, 1);
      setSelectedDate(newDate);
      if (!isSameMonth(newDate, monthCursor)) {
        setMonthCursor(newDate);
      }
    }
  }

  function handleToday(): void {
    const today = new Date();
    setSelectedDate(today);
    setMonthCursor(today);
  }

  const selectedDayAppointments = useMemo(() => {
    return appointmentsListByDayKey.get(selectedDateLabel) ?? [];
  }, [appointmentsListByDayKey, selectedDateLabel]);

  if (!clientId) {
    return (
      <div className="calendar-page">
        <Card>
          <Loader />
        </Card>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1 className="page-title">My Calendar</h1>
        <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Select
            options={[
              { value: 'month', label: 'Month' },
              { value: 'week', label: 'Week' },
              { value: 'day', label: 'Day' },
            ]}
            value={view}
            onChange={(e) => setView(e.target.value as any)}
          />
        </div>
      </div>

      <div className="calendar-layout calendar-layout-single">
        <Card
          title={monthTitle}
          subtitle={`Selected: ${selectedDateLabel}`}
          noPadding
        >
          <div className={`month-grid ${view === 'week' ? 'week-grid' : view === 'day' ? 'day-grid' : ''}`}>
            {view !== 'day' && (
              <>
                <div className="month-grid-header">Sun</div>
                <div className="month-grid-header">Mon</div>
                <div className="month-grid-header">Tue</div>
                <div className="month-grid-header">Wed</div>
                <div className="month-grid-header">Thu</div>
                <div className="month-grid-header">Fri</div>
                <div className="month-grid-header">Sat</div>
              </>
            )}

            {calendarDays.map((day) => {
              const inMonth = isSameMonth(day, monthCursor);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const dayKey = format(day, 'yyyy-MM-dd');
              const hasMeeting = (appointmentsByDayKey.get(dayKey) ?? 0) > 0;
              const dayAppointments = appointmentsListByDayKey.get(dayKey) ?? [];

              const MAX_CHIPS = view === 'day' ? 10 : view === 'week' ? 4 : 3;
              const meetingChips: DayChip[] = dayAppointments.slice(0, MAX_CHIPS).map((apt) => {
                return {
                  key: `apt-${apt.id}`,
                  kind: 'meeting',
                  label: formatAppointmentChip(apt),
                  color: '#4f7cff',
                };
              });
              const chips = meetingChips;
              const hiddenCount = Math.max(0, dayAppointments.length - chips.length);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={[
                    'month-grid-day',
                    inMonth ? 'in-month' : 'out-month',
                    isSelected ? 'selected' : '',
                    isToday ? 'today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleSelectDay(day)}
                >
                  <div className="month-grid-day-number">{format(day, 'd')}</div>
                  <div className="month-grid-day-body">
                    <div className="day-chips">
                      {chips.map((chip) => (
                        <div
                          key={chip.key}
                          className={`day-chip day-chip-${chip.kind}`}
                          style={{
                            background: chip.color ? `${chip.color}22` : undefined,
                            color: chip.color || undefined,
                            borderColor: chip.color ? `${chip.color}44` : undefined,
                          }}
                        >
                          {chip.label}
                        </div>
                      ))}
                      {hiddenCount > 0 && <div className="day-more">+{hiddenCount} more</div>}
                    </div>
                    <div className="month-grid-day-indicators">
                      {hasMeeting && <div className="day-indicator day-indicator-meeting"></div>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="calendar-month-nav" style={{ padding: '16px', borderTop: '1px solid #eef2f7' }}>
            <button
              type="button"
              onClick={handlePrev}
              style={{
                padding: '8px 12px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={handleToday}
              style={{
                padding: '8px 16px',
                background: '#4f7cff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              style={{
                padding: '8px 12px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Next →
            </button>
          </div>
        </Card>
      </div>

      {/* Selected Day Details */}
      <div className="calendar-details-below">
        <Card>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            Appointments on {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          {appointmentsLoading ? (
            <Loader />
          ) : appointmentsError ? (
            <p style={{ color: '#ef4444' }}>{appointmentsError}</p>
          ) : selectedDayAppointments.length === 0 ? (
            <div className="empty-calendar">
              <p>No appointments scheduled for this day.</p>
            </div>
          ) : (
            <div className="appointments-list">
              {selectedDayAppointments.map((apt) => {
                const startTime: any = (apt as any)?.startTime;
                const start =
                  startTime && typeof startTime.toDate === 'function'
                    ? startTime.toDate()
                    : startTime instanceof Date
                      ? startTime
                      : null;
                const timeStr = start ? format(start, 'h:mm a') : 'Time TBD';

                return (
                  <div key={apt.id} className="appointment-card">
                    <div className="appointment-time">{timeStr}</div>
                    <div className="appointment-details">
                      <h4>{apt.type?.replace('_', ' ').toUpperCase()}</h4>
                      <p>
                        {apt.medium === 'virtual' 
                          ? `Virtual - ${apt.virtualPlatform || 'Online'}` 
                          : apt.location || apt.address || 'In Person'}
                      </p>
                      {apt.notes && <p>Notes: {apt.notes}</p>}
                      <span className="appointment-type">{apt.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ClientCalendar;
