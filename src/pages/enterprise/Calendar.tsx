import React, { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import './Calendar.css';
import { UI_MESSAGES } from '../../constants';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { Appointment, CoachProfile, CoachTask } from '../../types';
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
  kind: 'meeting' | 'task';
  label: string;
};

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [showModal, setShowModal] = useState(false);
  const [monthCursor, setMonthCursor] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [didAutoSelectCoach, setDidAutoSelectCoach] = useState(false);

  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [coachesLoading, setCoachesLoading] = useState(false);
  const [coachesError, setCoachesError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  const [taskTitle, setTaskTitle] = useState('');
  const [tasks, setTasks] = useState<CoachTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const monthTitle = useMemo(() => format(monthCursor, 'MMMM yyyy'), [monthCursor]);
  const selectedDateLabel = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(monthCursor), { weekStartsOn: 0 });

    const days: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) {
      days.push(d);
    }
    return days;
  }, [monthCursor]);

  const handleSelectDay = (day: Date) => {
    setSelectedDate(day);
    if (!isSameMonth(day, monthCursor)) {
      setMonthCursor(day);
    }
  };

  useEffect(() => {
    setCoachesLoading(true);
    setCoachesError(null);

    const q = query(collection(db, 'coach_profiles'), orderBy('fullName', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as CoachProfile[];
        setCoaches(rows);
        setCoachesLoading(false);
      },
      (error) => {
        console.error('Error loading coaches:', error);
        setCoaches([]);
        setCoachesLoading(false);
        setCoachesError('Failed to load coaches.');
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (didAutoSelectCoach) return;
    if (selectedCoachId) {
      setDidAutoSelectCoach(true);
      return;
    }

    const email = user?.email?.toLowerCase();
    if (!email) return;

    const match = coaches.find((c) => (c.email || '').toLowerCase() === email);
    if (match) {
      setSelectedCoachId(match.id);
      setDidAutoSelectCoach(true);
    }
  }, [coaches, didAutoSelectCoach, selectedCoachId, user?.email]);

  const coachOptions = useMemo(() => {
    const base = [{ value: '', label: coachesLoading ? 'Loading coaches...' : 'Select coach' }];
    if (coachesError) return [{ value: '', label: 'Failed to load coaches' }];
    return base.concat(
      coaches.map((c) => ({
        value: c.id,
        label: c.fullName || c.email || c.id,
      }))
    );
  }, [coaches, coachesError, coachesLoading]);

  useEffect(() => {
    if (!selectedCoachId) {
      setAppointments([]);
      setAppointmentsLoading(false);
      setAppointmentsError(null);
      return;
    }

    setAppointmentsLoading(true);
    setAppointmentsError(null);

    const monthStart = startOfMonth(monthCursor);
    const monthEnd = endOfMonth(monthCursor);

    const q = query(
      collection(db, 'appointments'),
      where('coachId', '==', selectedCoachId),
      where('startTime', '>=', Timestamp.fromDate(monthStart)),
      where('startTime', '<=', Timestamp.fromDate(monthEnd)),
      orderBy('startTime', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          return {
            id: docSnap.id,
            ...data,
          } as Appointment;
        });

        setAppointments(rows);
        setAppointmentsLoading(false);
      },
      (error) => {
        console.error('Error loading appointments:', error);
        setAppointments([]);
        setAppointmentsLoading(false);
        setAppointmentsError('Failed to load appointments.');
      }
    );

    return () => unsubscribe();
  }, [monthCursor, selectedCoachId]);

  const appointmentsByDayKey = useMemo(() => {
    const map = new Map<string, number>();

    for (const apt of appointments) {
      const startTime = (apt as any)?.startTime;
      const aptDate: Date | null =
        startTime && typeof startTime.toDate === 'function'
          ? startTime.toDate()
          : startTime instanceof Date
            ? startTime
            : null;

      if (!aptDate) continue;

      const key = format(aptDate, 'yyyy-MM-dd');
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return map;
  }, [appointments]);

  const appointmentsListByDayKey = useMemo(() => {
    const map = new Map<string, Appointment[]>();

    for (const apt of appointments) {
      const startTime = (apt as any)?.startTime;
      const aptDate: Date | null =
        startTime && typeof startTime.toDate === 'function'
          ? startTime.toDate()
          : startTime instanceof Date
            ? startTime
            : null;
      if (!aptDate) continue;

      const key = format(aptDate, 'yyyy-MM-dd');
      const prev = map.get(key) ?? [];
      map.set(key, prev.concat(apt));
    }

    // Sort each day by startTime asc for stable chip order
    map.forEach((list, key) => {
      const sorted = list.slice().sort((a, b) => {
        const aStart: any = (a as any)?.startTime;
        const bStart: any = (b as any)?.startTime;
        const ad = aStart && typeof aStart.toDate === 'function' ? aStart.toDate() : null;
        const bd = bStart && typeof bStart.toDate === 'function' ? bStart.toDate() : null;
        if (!ad || !bd) return 0;
        return ad.getTime() - bd.getTime();
      });
      map.set(key, sorted);
    });

    return map;
  }, [appointments]);

  const selectedDayAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const startTime = (apt as any)?.startTime;
      const aptDate: Date | null =
        startTime && typeof startTime.toDate === 'function'
          ? startTime.toDate()
          : startTime instanceof Date
            ? startTime
            : null;
      if (!aptDate) return false;
      return isSameDay(aptDate, selectedDate);
    });
  }, [appointments, selectedDate]);

  useEffect(() => {
    if (!selectedCoachId) {
      setTasks([]);
      setTasksLoading(false);
      setTasksError(null);
      return;
    }

    setTasksLoading(true);
    setTasksError(null);

    const monthStart = startOfMonth(monthCursor);
    const monthEnd = endOfMonth(monthCursor);

    const q = query(
      collection(db, 'coach_tasks'),
      where('coachId', '==', selectedCoachId),
      where('dueDate', '>=', Timestamp.fromDate(monthStart)),
      where('dueDate', '<=', Timestamp.fromDate(monthEnd)),
      orderBy('dueDate', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          return {
            id: docSnap.id,
            ...data,
          } as CoachTask;
        });

        setTasks(rows);
        setTasksLoading(false);
      },
      (error) => {
        console.error('Error loading tasks:', error);
        setTasks([]);
        setTasksLoading(false);
        setTasksError('Failed to load tasks.');
      }
    );

    return () => unsubscribe();
  }, [monthCursor, selectedCoachId]);

  const tasksByDayKey = useMemo(() => {
    const map = new Map<string, number>();

    for (const t of tasks) {
      const due: any = (t as any)?.dueDate;
      const dueDate: Date | null =
        due && typeof due.toDate === 'function' ? due.toDate() : due instanceof Date ? due : null;
      if (!dueDate) continue;

      const key = format(dueDate, 'yyyy-MM-dd');
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    return map;
  }, [tasks]);

  const tasksListByDayKey = useMemo(() => {
    const map = new Map<string, CoachTask[]>();

    for (const t of tasks) {
      const due: any = (t as any)?.dueDate;
      const dueDate: Date | null =
        due && typeof due.toDate === 'function' ? due.toDate() : due instanceof Date ? due : null;
      if (!dueDate) continue;

      const key = format(dueDate, 'yyyy-MM-dd');
      const prev = map.get(key) ?? [];
      map.set(key, prev.concat(t));
    }

    return map;
  }, [tasks]);

  const selectedDayTasks = useMemo(() => {
    return tasks.filter((t) => {
      const due: any = (t as any)?.dueDate;
      const dueDate: Date | null =
        due && typeof due.toDate === 'function' ? due.toDate() : due instanceof Date ? due : null;
      if (!dueDate) return false;
      return isSameDay(dueDate, selectedDate);
    });
  }, [selectedDate, tasks]);

  const createTask = async () => {
    const title = taskTitle.trim();
    if (!selectedCoachId || !title) return;

    try {
      await addDoc(collection(db, 'coach_tasks'), {
        coachId: selectedCoachId,
        title,
        dueDate: Timestamp.fromDate(startOfDay(selectedDate)),
        status: 'open',
        createdAt: Timestamp.now(),
      });
      setTaskTitle('');
    } catch (e) {
      console.error('Error creating task:', e);
      alert('Failed to create task.');
    }
  };

  const toggleTaskStatus = async (task: CoachTask) => {
    try {
      const nextStatus: CoachTask['status'] = task.status === 'done' ? 'open' : 'done';
      await updateDoc(doc(db, 'coach_tasks', task.id), {
        status: nextStatus,
        updatedAt: Timestamp.now(),
      });
    } catch (e) {
      console.error('Error updating task:', e);
      alert('Failed to update task.');
    }
  };

  return (
    <div className="calendar-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
        </div>
        <div className="page-actions">
          <div className="calendar-month-nav">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setMonthCursor((prev) => addMonths(prev, -1))}
            >
              Prev
            </Button>
            <Button
              variant="ghost"
              size="small"
              onClick={() => {
                const now = new Date();
                setMonthCursor(now);
                setSelectedDate(now);
              }}
            >
              Today
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => setMonthCursor((prev) => addMonths(prev, 1))}
            >
              Next
            </Button>
          </div>
          <Select
            options={[
              { value: 'month', label: 'Month' },
              { value: 'week', label: 'Week' },
              { value: 'day', label: 'Day' },
            ]}
            value={view}
            onChange={(e) => setView(e.target.value as any)}
          />
          <Select
            options={coachOptions}
            value={selectedCoachId ?? ''}
            onChange={(e) => setSelectedCoachId(e.target.value || null)}
          />
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + New Appointment
          </Button>
        </div>
      </div>

      <div className="calendar-layout calendar-layout-single">
        <Card
          title={monthTitle}
          subtitle={`Selected: ${selectedDateLabel}`}
          actions={
            <div className="calendar-legend">
              <span className="calendar-legend-item">
                <span className="calendar-legend-dot calendar-legend-dot-meeting" />
                Meetings
              </span>
              <span className="calendar-legend-item">
                <span className="calendar-legend-dot calendar-legend-dot-task" />
                Tasks
              </span>
            </div>
          }
          noPadding
        >
          <div className="month-grid">
            <div className="month-grid-header">Sun</div>
            <div className="month-grid-header">Mon</div>
            <div className="month-grid-header">Tue</div>
            <div className="month-grid-header">Wed</div>
            <div className="month-grid-header">Thu</div>
            <div className="month-grid-header">Fri</div>
            <div className="month-grid-header">Sat</div>

            {calendarDays.map((day) => {
              const inMonth = isSameMonth(day, monthCursor);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const dayKey = format(day, 'yyyy-MM-dd');
              const hasMeeting = (appointmentsByDayKey.get(dayKey) ?? 0) > 0;
              const hasTask = (tasksByDayKey.get(dayKey) ?? 0) > 0;
              const dayAppointments = appointmentsListByDayKey.get(dayKey) ?? [];
              const dayTasks = tasksListByDayKey.get(dayKey) ?? [];

              const MAX_CHIPS = 3;
              const meetingChips: DayChip[] = dayAppointments.slice(0, MAX_CHIPS).map((apt) => ({
                key: `apt-${apt.id}`,
                kind: 'meeting',
                label: formatAppointmentChip(apt),
              }));
              const remainingSlots = MAX_CHIPS - meetingChips.length;
              const taskChips: DayChip[] =
                remainingSlots > 0
                  ? dayTasks.slice(0, remainingSlots).map((t) => ({
                      key: `task-${t.id}`,
                      kind: 'task',
                      label: t.title,
                    }))
                  : [];
              const chips = meetingChips.concat(taskChips);
              const hiddenCount = Math.max(0, dayAppointments.length + dayTasks.length - chips.length);

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
                          className={`day-chip ${chip.kind === 'meeting' ? 'day-chip-meeting' : 'day-chip-task'}`}
                          title={chip.label}
                        >
                          {chip.label}
                        </div>
                      ))}
                      {hiddenCount > 0 && <div className="day-more">+{hiddenCount} more</div>}
                    </div>
                    <div className="month-grid-day-indicators">
                      {hasMeeting && <span className="day-indicator day-indicator-meeting" />}
                      {hasTask && <span className="day-indicator day-indicator-task" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="calendar-details-below">
          <Card title={`Agenda - ${selectedDateLabel}`}>
            {!selectedCoachId ? (
              <div className="empty-calendar">
                <p>Select a coach to view meetings and tasks.</p>
              </div>
            ) : appointmentsLoading ? (
              <Loader message="Loading meetings..." />
            ) : appointmentsError ? (
              <div className="empty-calendar">
                <p>{appointmentsError}</p>
              </div>
            ) : selectedDayAppointments.length === 0 ? (
              <div className="empty-calendar">
                <p>No meetings scheduled for this date.</p>
              </div>
            ) : (
              <div className="appointments-list">
                {selectedDayAppointments.map((apt) => {
                  const startTime: any = (apt as any)?.startTime;
                  const endTime: any = (apt as any)?.endTime;
                  const start = startTime && typeof startTime.toDate === 'function' ? startTime.toDate() : null;
                  const end = endTime && typeof endTime.toDate === 'function' ? endTime.toDate() : null;

                  return (
                    <div key={apt.id} className="appointment-card">
                      <div className="appointment-time">
                        {start ? format(start, 'hh:mm a') : '--:--'}
                        {end ? ` - ${format(end, 'hh:mm a')}` : ''}
                      </div>
                      <div className="appointment-details">
                        <h4>{apt.type ? String(apt.type).replace('_', ' ') : 'Meeting'}</h4>
                        <p>Client: {apt.clientId}</p>
                        <p>Status: {apt.status}</p>
                        <span className="appointment-type">{apt.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <div className="tasks-panel">
            <Card
              title="Todo / Follow-ups"
              subtitle={selectedDateLabel}
              actions={
                <div className="task-add">
                  <Input
                    placeholder="Add a task..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    disabled={!selectedCoachId}
                  />
                  <Button
                    variant="primary"
                    onClick={createTask}
                    disabled={!selectedCoachId || !taskTitle.trim()}
                  >
                    Add
                  </Button>
                </div>
              }
            >
              {!selectedCoachId ? (
                <div className="empty-calendar">
                  <p>Select a coach to manage tasks.</p>
                </div>
              ) : tasksLoading ? (
                <Loader message="Loading tasks..." />
              ) : tasksError ? (
                <div className="empty-calendar">
                  <p>{tasksError}</p>
                </div>
              ) : selectedDayTasks.length === 0 ? (
                <div className="empty-calendar">
                  <p>No tasks due for this date.</p>
                </div>
              ) : (
                <div className="tasks-list">
                  {selectedDayTasks.map((t) => (
                    <div key={t.id} className={`task-row ${t.status === 'done' ? 'done' : ''}`}>
                      <button type="button" className="task-check" onClick={() => toggleTaskStatus(t)}>
                        {t.status === 'done' ? '✓' : ''}
                      </button>
                      <div className="task-title">{t.title}</div>
                      <Button variant="ghost" size="small" onClick={() => toggleTaskStatus(t)}>
                        {t.status === 'done' ? 'Reopen' : 'Done'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
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
