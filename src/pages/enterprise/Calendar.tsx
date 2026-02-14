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

// Generate consistent color for each coach
function getCoachColor(coachId: string, index: number): string {
  const colors = [
    '#4f7cff', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
    '#6366f1', // indigo
    '#14b8a6', // teal
  ];
  
  // Use index if provided, otherwise hash the coachId
  if (index >= 0) {
    return colors[index % colors.length];
  }
  
  // Simple hash function for consistent color per coachId
  let hash = 0;
  for (let i = 0; i < coachId.length; i++) {
    hash = coachId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

type DayChip = {
  key: string;
  kind: 'meeting' | 'task';
  label: string;
  coachId?: string;
  coachName?: string;
  color?: string;
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
  
  // Appointment form state
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [appointmentClientId, setAppointmentClientId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [appointmentType, setAppointmentType] = useState<'training' | 'consultation' | 'assessment' | 'follow_up'>('training');
  const [appointmentDuration, setAppointmentDuration] = useState(60);
  const [appointmentMedium, setAppointmentMedium] = useState<'in_person' | 'virtual'>('in_person');
  const [appointmentAddress, setAppointmentAddress] = useState('');
  const [appointmentVirtualPlatform, setAppointmentVirtualPlatform] = useState<'zoom' | 'google_meet' | 'teams'>('zoom');
  const [appointmentSaving, setAppointmentSaving] = useState(false);

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
    for (let d = start; d <= end; d = addDays(d, 1)) {
      days.push(d);
    }
    return days;
  }, [monthCursor, selectedDate, view]);

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

  // Load clients for appointment form
  useEffect(() => {
    setClientsLoading(true);
    const q = query(collection(db, 'client_profiles'), orderBy('fullName', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        setClients(rows);
        setClientsLoading(false);
      },
      (error) => {
        console.error('Error loading clients:', error);
        setClients([]);
        setClientsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const coachOptions = useMemo(() => {
    const base = [{ value: '', label: coachesLoading ? 'Loading coaches...' : 'All Coaches' }];
    if (coachesError) return [{ value: '', label: 'Failed to load coaches' }];
    return base.concat(
      coaches.map((c) => ({
        value: c.id,
        label: c.fullName || c.email || c.id,
      }))
    );
  }, [coaches, coachesError, coachesLoading]);

  // Create color map for coaches
  const coachColorMap = useMemo(() => {
    const map = new Map<string, string>();
    coaches.forEach((coach, index) => {
      map.set(coach.id, getCoachColor(coach.id, index));
    });
    return map;
  }, [coaches]);

  // Create coach name map for easy lookup
  const coachNameMap = useMemo(() => {
    const map = new Map<string, string>();
    coaches.forEach((coach) => {
      map.set(coach.id, coach.fullName || coach.email || 'Unknown Coach');
    });
    return map;
  }, [coaches]);

  // Create client name map for easy lookup
  const clientNameMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((client) => {
      map.set(client.id, client.fullName || client.email || 'Unknown Client');
    });
    return map;
  }, [clients]);

  useEffect(() => {
    setAppointmentsLoading(true);
    setAppointmentsError(null);

    let rangeStart: Date, rangeEnd: Date;
    
    if (view === 'day') {
      rangeStart = startOfDay(selectedDate);
      rangeEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
    } else if (view === 'week') {
      rangeStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      rangeEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
    } else {
      rangeStart = startOfMonth(monthCursor);
      rangeEnd = endOfMonth(monthCursor);
    }

    // Query all appointments if no coach selected, or just one coach's appointments
    const q = selectedCoachId
      ? query(collection(db, 'appointments'), where('coachId', '==', selectedCoachId))
      : query(collection(db, 'appointments'));
    
    // Capture dates for filtering
    const startDate = rangeStart;
    const endDate = rangeEnd;

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

        // Filter by date range and sort - ALL in JavaScript
        const filteredRows = rows
          .filter((apt) => {
            const startTime = (apt as any)?.startTime;
            const aptDate: Date | null =
              startTime && typeof startTime.toDate === 'function'
                ? startTime.toDate()
                : startTime instanceof Date
                  ? startTime
                  : null;
            
            if (!aptDate) return false;
            return aptDate >= startDate && aptDate <= endDate;
          })
          .sort((a, b) => {
            // Sort by startTime ascending
            const aStart: any = (a as any)?.startTime;
            const bStart: any = (b as any)?.startTime;
            const aDate = aStart && typeof aStart.toDate === 'function' ? aStart.toDate() : null;
            const bDate = bStart && typeof bStart.toDate === 'function' ? bStart.toDate() : null;
            if (!aDate || !bDate) return 0;
            return aDate.getTime() - bDate.getTime();
          });

        console.log(`Loaded ${filteredRows.length} appointments${selectedCoachId ? ' for coach ' + selectedCoachId : ' (all coaches)'} between ${format(startDate, 'yyyy-MM-dd')} and ${format(endDate, 'yyyy-MM-dd')}:`, filteredRows);
        setAppointments(filteredRows);
        setAppointmentsLoading(false);
        setAppointmentsError(null);
      },
      (error) => {
        console.error('Error loading appointments:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Check if it's an index error
        if (error.message.includes('index')) {
          setAppointmentsError('Firestore index required. Check console for link to create it.');
        } else {
          setAppointmentsError(`Failed to load appointments: ${error.message}`);
        }
        
        setAppointments([]);
        setAppointmentsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [monthCursor, selectedCoachId, selectedDate, view]);

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
    setTasksLoading(true);
    setTasksError(null);

    let rangeStart: Date, rangeEnd: Date;
    
    if (view === 'day') {
      rangeStart = startOfDay(selectedDate);
      rangeEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
    } else if (view === 'week') {
      rangeStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      rangeEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
    } else {
      rangeStart = startOfMonth(monthCursor);
      rangeEnd = endOfMonth(monthCursor);
    }

    // Query all tasks if no coach selected, or just one coach's tasks
    const q = selectedCoachId
      ? query(collection(db, 'coach_tasks'), where('coachId', '==', selectedCoachId))
      : query(collection(db, 'coach_tasks'));
    
    // Capture dates for filtering
    const startDate = rangeStart;
    const endDate = rangeEnd;

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

        // Filter by date range and sort - ALL in JavaScript
        const filteredRows = rows
          .filter((task) => {
            const due: any = (task as any)?.dueDate;
            const dueDate: Date | null =
              due && typeof due.toDate === 'function' ? due.toDate() : due instanceof Date ? due : null;
            
            if (!dueDate) return false;
            return dueDate >= startDate && dueDate <= endDate;
          })
          .sort((a, b) => {
            // Sort by dueDate ascending
            const aDue: any = (a as any)?.dueDate;
            const bDue: any = (b as any)?.dueDate;
            const aDate = aDue && typeof aDue.toDate === 'function' ? aDue.toDate() : null;
            const bDate = bDue && typeof bDue.toDate === 'function' ? bDue.toDate() : null;
            if (!aDate || !bDate) return 0;
            return aDate.getTime() - bDate.getTime();
          });

        setTasks(filteredRows);
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
  }, [monthCursor, selectedCoachId, selectedDate, view]);

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

  const createAppointment = async () => {
    if (!selectedCoachId || !appointmentClientId || !appointmentDate || !appointmentTime) {
      alert('Please fill in all required fields.');
      return;
    }

    // Validate medium-specific fields
    if (appointmentMedium === 'in_person' && !appointmentAddress.trim()) {
      alert('Please enter an address for in-person appointments.');
      return;
    }

    setAppointmentSaving(true);
    try {
      // Combine date and time
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const startDateTime = new Date(appointmentDate);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + appointmentDuration);

      const appointmentData: any = {
        coachId: selectedCoachId,
        clientId: appointmentClientId,
        startTime: Timestamp.fromDate(startDateTime),
        endTime: Timestamp.fromDate(endDateTime),
        type: appointmentType,
        medium: appointmentMedium,
        status: 'scheduled',
        notes: '',
        createdAt: Timestamp.now(),
      };

      // Add medium-specific fields
      if (appointmentMedium === 'in_person') {
        appointmentData.address = appointmentAddress;
      } else {
        appointmentData.virtualPlatform = appointmentVirtualPlatform;
      }

      console.log('Creating appointment:', appointmentData);

      const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
      
      console.log('Appointment created successfully with ID:', docRef.id);

      // Reset form and close modal
      setAppointmentClientId('');
      setAppointmentDate('');
      setAppointmentTime('09:00');
      setAppointmentType('training');
      setAppointmentDuration(60);
      setAppointmentMedium('in_person');
      setAppointmentAddress('');
      setAppointmentVirtualPlatform('zoom');
      setShowModal(false);
      
      alert('Appointment created successfully!');
      
    } catch (e: any) {
      console.error('Error creating appointment:', e);
      alert(`Failed to create appointment: ${e.message || 'Unknown error'}`);
    } finally {
      setAppointmentSaving(false);
    }
  };

  // Initialize form with selected date when modal opens
  useEffect(() => {
    if (showModal && selectedDate) {
      setAppointmentDate(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [showModal, selectedDate]);

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
              onClick={() => {
                if (view === 'day') {
                  setSelectedDate((prev) => addDays(prev, -1));
                  setMonthCursor((prev) => addDays(prev, -1));
                } else if (view === 'week') {
                  setSelectedDate((prev) => addWeeks(prev, -1));
                  setMonthCursor((prev) => addWeeks(prev, -1));
                } else {
                  setMonthCursor((prev) => addMonths(prev, -1));
                }
              }}
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
              onClick={() => {
                if (view === 'day') {
                  setSelectedDate((prev) => addDays(prev, 1));
                  setMonthCursor((prev) => addDays(prev, 1));
                } else if (view === 'week') {
                  setSelectedDate((prev) => addWeeks(prev, 1));
                  setMonthCursor((prev) => addWeeks(prev, 1));
                } else {
                  setMonthCursor((prev) => addMonths(prev, 1));
                }
              }}
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
              const hasTask = (tasksByDayKey.get(dayKey) ?? 0) > 0;
              const dayAppointments = appointmentsListByDayKey.get(dayKey) ?? [];
              const dayTasks = tasksListByDayKey.get(dayKey) ?? [];

              const MAX_CHIPS = view === 'day' ? 10 : view === 'week' ? 4 : 3;
              const meetingChips: DayChip[] = dayAppointments.slice(0, MAX_CHIPS).map((apt) => {
                const coachName = coachNameMap.get(apt.coachId) || 'Unknown';
                const coachColor = coachColorMap.get(apt.coachId) || '#4f7cff';
                const label = selectedCoachId 
                  ? formatAppointmentChip(apt) 
                  : `${coachName}: ${formatAppointmentChip(apt)}`;
                
                return {
                  key: `apt-${apt.id}`,
                  kind: 'meeting',
                  label,
                  coachId: apt.coachId,
                  coachName,
                  color: coachColor,
                };
              });
              const remainingSlots = MAX_CHIPS - meetingChips.length;
              const taskChips: DayChip[] =
                remainingSlots > 0
                  ? dayTasks.slice(0, remainingSlots).map((t) => {
                      const coachName = coachNameMap.get(t.coachId) || 'Unknown';
                      const coachColor = coachColorMap.get(t.coachId) || '#10b981';
                      const label = selectedCoachId 
                        ? t.title 
                        : `${coachName}: ${t.title}`;
                      
                      return {
                        key: `task-${t.id}`,
                        kind: 'task',
                        label,
                        coachId: t.coachId,
                        coachName,
                        color: coachColor,
                      };
                    })
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
                  <div className="month-grid-day-number">
                    {view === 'day' || view === 'week' ? format(day, 'EEE d') : format(day, 'd')}
                  </div>
                  <div className="month-grid-day-body">
                    <div className="day-chips">
                      {chips.map((chip) => (
                        <div
                          key={chip.key}
                          className={`day-chip ${chip.kind === 'meeting' ? 'day-chip-meeting' : 'day-chip-task'}`}
                          style={chip.color ? {
                            backgroundColor: `${chip.color}15`,
                            borderColor: `${chip.color}40`,
                            color: chip.color,
                          } : undefined}
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
                  const clientName = clientNameMap.get(apt.clientId) || apt.clientId || 'Unknown Client';
                  const coachName = coachNameMap.get(apt.coachId) || apt.coachId || 'Unknown Coach';

                  return (
                    <div key={apt.id} className="appointment-card">
                      <div className="appointment-time">
                        {start ? format(start, 'hh:mm a') : '--:--'}
                        {end ? ` - ${format(end, 'hh:mm a')}` : ''}
                      </div>
                      <div className="appointment-details">
                        <h4>{apt.type ? String(apt.type).replace('_', ' ') : 'Meeting'}</h4>
                        <p>Client: {clientName}</p>
                        {!selectedCoachId && <p>Coach: {coachName}</p>}
                        <p>Status: {apt.status}</p>
                        {(apt as any).medium && (
                          <p>
                            Medium: {(apt as any).medium === 'in_person' ? 'In Person' : 'Virtual'}
                            {(apt as any).medium === 'in_person' && (apt as any).address && ` - ${(apt as any).address}`}
                            {(apt as any).medium === 'virtual' && (apt as any).virtualPlatform && 
                              ` - ${(apt as any).virtualPlatform.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`}
                          </p>
                        )}
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
              { value: '', label: clientsLoading ? 'Loading clients...' : 'Select a client' },
              ...clients.map((c: any) => ({
                value: c.id,
                label: c.fullName || c.email || c.id,
              })),
            ]}
            value={appointmentClientId}
            onChange={(e) => setAppointmentClientId(e.target.value)}
            required
          />
          <Input 
            label="Date" 
            type="date" 
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            required
          />
          <Input 
            label="Start Time" 
            type="time" 
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            required
          />
          <Input 
            label="Duration (minutes)" 
            type="number" 
            value={String(appointmentDuration)}
            onChange={(e) => setAppointmentDuration(Number(e.target.value))}
            required
          />
          <Select
            label="Type"
            options={[
              { value: 'training', label: 'Training' },
              { value: 'consultation', label: 'Consultation' },
              { value: 'assessment', label: 'Assessment' },
              { value: 'follow_up', label: 'Follow-up' },
            ]}
            value={appointmentType}
            onChange={(e) => setAppointmentType(e.target.value as any)}
            required
          />
          <Select
            label="Medium"
            options={[
              { value: 'in_person', label: 'In Person' },
              { value: 'virtual', label: 'Virtual' },
            ]}
            value={appointmentMedium}
            onChange={(e) => setAppointmentMedium(e.target.value as 'in_person' | 'virtual')}
            required
          />
          {appointmentMedium === 'in_person' ? (
            <Input
              label="Address"
              type="text"
              value={appointmentAddress}
              onChange={(e) => setAppointmentAddress(e.target.value)}
              placeholder="Enter meeting address"
              required
            />
          ) : (
            <Select
              label="Virtual Platform"
              options={[
                { value: 'zoom', label: 'Zoom' },
                { value: 'google_meet', label: 'Google Meet' },
                { value: 'teams', label: 'Microsoft Teams' },
              ]}
              value={appointmentVirtualPlatform}
              onChange={(e) => setAppointmentVirtualPlatform(e.target.value as 'zoom' | 'google_meet' | 'teams')}
              required
            />
          )}
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={appointmentSaving}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={createAppointment}
              loading={appointmentSaving}
              disabled={!selectedCoachId || !appointmentClientId || !appointmentDate || !appointmentTime}
            >
              Create Appointment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Calendar;
