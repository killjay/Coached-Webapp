import React, { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { ClientProfile, Exercise, Template, TemplateAssignment, WorkoutPlan } from '../../types';
import './WorkoutPlanner.css';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type TemplateStatus = 'draft' | 'published';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Glutes',
  'Core',
  'Full Body',
  'Cardio',
] as const;

function safeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function extractYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return u.pathname.replace('/', '') || null;
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = u.searchParams.get('v');
      if (v) return v;
      // /shorts/<id> or /embed/<id>
      const parts = u.pathname.split('/').filter(Boolean);
      const idx = parts.findIndex((p) => p === 'shorts' || p === 'embed');
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
    return null;
  } catch {
    return null;
  }
}

function toYouTubeEmbed(url: string): string | null {
  const id = extractYouTubeVideoId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

const emptySchedule = (): WorkoutPlan['schedule'] =>
  DAYS.reduce((acc, day) => {
    acc[day] = [];
    return acc;
  }, {} as WorkoutPlan['schedule']);

const WorkoutPlanner: React.FC = () => {
  const { user } = useAuth();
  const coachId = user?.uid || '';

  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [durationWeeks, setDurationWeeks] = useState<number>(8);
  const [status, setStatus] = useState<TemplateStatus>('draft');
  const [tags, setTags] = useState<string>('');

  const [selectedDay, setSelectedDay] = useState<(typeof DAYS)[number]>('Monday');
  const [filterMuscleGroup, setFilterMuscleGroup] = useState<string>('');
  const [exerciseSearch, setExerciseSearch] = useState<string>('');
  const [schedule, setSchedule] = useState<WorkoutPlan['schedule']>(emptySchedule());

  const [exerciseDraft, setExerciseDraft] = useState<Partial<Exercise>>({
    name: '',
    sets: 3,
    reps: 10,
    restPeriod: 60,
    instructions: '',
    videoURL: '',
    muscleGroups: [],
  });

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [assignClientId, setAssignClientId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const coachTemplatesQuery = useMemo(() => {
    if (!coachId) return null;
    return query(collection(db, 'templates'), where('coachId', '==', coachId), where('type', '==', 'workout'));
  }, [coachId]);

  useEffect(() => {
    if (!coachTemplatesQuery) return;
    setTemplatesError(null);
    setTemplatesLoading(true);
    const unsub = onSnapshot(
      coachTemplatesQuery,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Template[];
        setTemplates(list);
        setTemplatesLoading(false);
      },
      (err) => {
        console.error('Failed to load templates', err);
        setTemplates([]);
        setTemplatesError('Failed to load templates. Please refresh and try again.');
        setTemplatesLoading(false);
      }
    );
    return () => unsub();
  }, [coachTemplatesQuery]);

  useEffect(() => {
    setClientsError(null);
    setClientsLoading(true);
    const q = query(collection(db, 'client_profiles'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ClientProfile[];
        setClients(list);
        setClientsLoading(false);
      },
      (err) => {
        console.error('Failed to load clients', err);
        setClients([]);
        setClientsError('Failed to load clients. Please refresh and try again.');
        setClientsLoading(false);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedTemplate) return;
    setName(selectedTemplate.name || '');
    setDescription(selectedTemplate.description || '');
    setDifficulty((selectedTemplate.difficulty as Difficulty) || 'beginner');
    setDurationWeeks(selectedTemplate.duration || 8);
    setStatus((selectedTemplate.status as TemplateStatus) || 'draft');
    setTags((selectedTemplate.tags || []).join(', '));

    const content = selectedTemplate.content as WorkoutPlan;
    const nextSchedule = content?.schedule ? { ...emptySchedule(), ...content.schedule } : emptySchedule();
    setSchedule(nextSchedule);
  }, [selectedTemplate]);

  const templateTagList = useMemo(() => {
    return tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }, [tags]);

  const validateTemplate = () => {
    if (!coachId) return 'You must be logged in.';
    if (!name.trim()) return 'Template name is required.';
    const totalExercises = Object.values(schedule).reduce((sum, list) => sum + (list?.length || 0), 0);
    if (totalExercises === 0) return 'Add at least one exercise to the schedule.';
    return null;
  };

  const addExerciseToDay = () => {
    const n = (exerciseDraft.name || '').trim();
    if (!n) return;

    const ex: Exercise = {
      id: safeId(),
      name: n,
      sets: Number(exerciseDraft.sets || 0) || 3,
      reps: Number(exerciseDraft.reps || 0) || 10,
      restPeriod: Number(exerciseDraft.restPeriod || 0) || 60,
      instructions: String(exerciseDraft.instructions || ''),
      videoURL: String(exerciseDraft.videoURL || '') || undefined,
      muscleGroups: Array.isArray(exerciseDraft.muscleGroups) ? exerciseDraft.muscleGroups : [],
    };

    setSchedule((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), ex],
    }));

    setExerciseDraft((prev) => ({
      ...prev,
      name: '',
      instructions: '',
      videoURL: '',
      muscleGroups: [],
    }));
  };

  const removeExercise = (day: string, exerciseId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((e) => e.id !== exerciseId),
    }));
  };

  const toggleMuscleGroup = (group: string) => {
    setExerciseDraft((prev) => {
      const current = Array.isArray(prev.muscleGroups) ? prev.muscleGroups : [];
      const next = current.includes(group) ? current.filter((g) => g !== group) : [...current, group];
      return { ...prev, muscleGroups: next };
    });
  };

  const resetForm = () => {
    setSelectedTemplateId(null);
    setName('');
    setDescription('');
    setDifficulty('beginner');
    setDurationWeeks(8);
    setStatus('draft');
    setTags('');
    setSelectedDay('Monday');
    setSchedule(emptySchedule());
    setExerciseDraft({
      name: '',
      sets: 3,
      reps: 10,
      restPeriod: 60,
      instructions: '',
      videoURL: '',
      muscleGroups: [],
    });
    setSaveError(null);
    setAssignClientId('');
    setAssignError(null);
    setAssignSuccess(null);
  };

  const handleSave = async (nextStatus: TemplateStatus) => {
    setSaveError(null);
    setAssignSuccess(null);

    const validationError = validateTemplate();
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    setSaving(true);
    try {
      const now = Timestamp.now();

      const payload: Omit<Template, 'id'> = {
        coachId,
        name: name.trim(),
        description: description.trim(),
        type: 'workout',
        difficulty,
        duration: Number(durationWeeks) || 8,
        content: { schedule } as WorkoutPlan,
        status: nextStatus,
        tags: templateTagList,
        createdAt: now,
        updatedAt: now,
      };

      if (selectedTemplateId) {
        await updateDoc(doc(db, 'templates', selectedTemplateId), { ...payload, updatedAt: now } as any);
        setStatus(nextStatus);
      } else {
        const ref = await addDoc(collection(db, 'templates'), payload as any);
        setSelectedTemplateId(ref.id);
        setStatus(nextStatus);
      }
    } catch (err: any) {
      console.error('Failed to save template', err);
      setSaveError(err?.message || 'Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplateId) return;
    if (!window.confirm('Delete this template? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'templates', selectedTemplateId));
      resetForm();
    } catch (err) {
      console.error('Failed to delete template', err);
      setSaveError('Failed to delete template.');
    }
  };

  const handleAssign = async () => {
    setAssignError(null);
    setAssignSuccess(null);

    if (!selectedTemplateId) {
      setAssignError('Save the template first.');
      return;
    }
    if (status !== 'published') {
      setAssignError('Publish the template before assigning it to a client.');
      return;
    }
    if (!assignClientId) {
      setAssignError('Select a client to assign this plan.');
      return;
    }

    setAssigning(true);
    try {
      const now = Timestamp.now();
      const assignmentId = `${assignClientId}_${selectedTemplateId}`;
      const payload: TemplateAssignment = {
        id: assignmentId,
        templateId: selectedTemplateId,
        clientId: assignClientId,
        coachId,
        startDate: now,
        status: 'active',
        progress: 0,
        notes: '',
        createdAt: now,
      };
      await setDoc(doc(db, 'template_assignments', assignmentId), payload as any, { merge: true });
      const clientName = clients.find((c) => c.id === assignClientId)?.fullName || 'client';
      setAssignSuccess(`Assigned to ${clientName}.`);
    } catch (err: any) {
      console.error('Failed to assign template', err);
      setAssignError(err?.message || 'Failed to assign plan. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const embedUrl = useMemo(() => {
    const url = String(exerciseDraft.videoURL || '').trim();
    if (!url) return null;
    return toYouTubeEmbed(url);
  }, [exerciseDraft.videoURL]);

  return (
    <div className="workout-planner-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workout Planner</h1>
          <p className="page-description">Create workout templates and assign them to clients</p>
        </div>
        <Button variant="secondary" onClick={resetForm}>
          + New Template
        </Button>
      </div>

      <div className="workout-planner-grid">
        <Card title="My Workout Templates" className="templates-panel">
          {templatesLoading ? (
            <Loader />
          ) : templatesError ? (
            <div className="error-text">{templatesError}</div>
          ) : templates.length === 0 ? (
            <div className="empty-text">No templates yet. Create your first workout plan.</div>
          ) : (
            <div className="template-list">
              {templates
                .slice()
                .sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0))
                .map((t) => (
                  <button
                    key={t.id}
                    className={`template-item ${selectedTemplateId === t.id ? 'active' : ''}`}
                    onClick={() => setSelectedTemplateId(t.id)}
                  >
                    <div className="template-item-main">
                      <div className="template-item-title">{t.name}</div>
                      <div className="template-item-subtitle">
                        {t.difficulty} • {t.duration} weeks
                      </div>
                    </div>
                    <span className={`status-pill status-${t.status}`}>{t.status}</span>
                  </button>
                ))}
            </div>
          )}
        </Card>

        <div className="editor-panel">
          <Card title="Template Details">
            {saveError && <div className="error-banner">{saveError}</div>}
            <div className="form-grid">
              <Input
                label="Template Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Strength Split (8 weeks)"
                required
              />
              <Select
                label="Difficulty"
                options={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                ]}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              />
              <Input
                label="Duration (weeks)"
                type="number"
                value={String(durationWeeks)}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                placeholder="8"
              />
              <Input
                label="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="strength, hypertrophy, beginner"
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description for coaches/clients"
              />
            </div>

            <div className="template-actions">
              <Button variant="secondary" onClick={() => handleSave('draft')} disabled={saving}>
                Save Draft
              </Button>
              <Button variant="success" onClick={() => handleSave('published')} loading={saving}>
                Publish
              </Button>
              {selectedTemplateId && (
                <Button variant="danger" onClick={handleDelete} disabled={saving}>
                  Delete
                </Button>
              )}
            </div>
            {selectedTemplateId && (
              <div className="meta-row">
                <span className={`status-pill status-${status}`}>Status: {status}</span>
              </div>
            )}
          </Card>

          <Card title="Schedule Builder" subtitle="Add exercises to each day">
            <div className="schedule-toolbar">
              <Select
                label="Day"
                options={DAYS.map((d) => ({ value: d, label: d }))}
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value as any)}
              />
              <Select
                label="Filter"
                options={[
                  { value: '', label: 'All muscle groups' },
                  ...MUSCLE_GROUPS.map((g) => ({ value: g, label: g })),
                ]}
                value={filterMuscleGroup}
                onChange={(e) => setFilterMuscleGroup(e.target.value)}
              />
              <Input
                label="Search"
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                placeholder="Search exercises..."
              />
            </div>

            <div className="exercise-builder">
              <div className="exercise-builder-grid">
                <Input
                  label="Exercise name"
                  value={String(exerciseDraft.name || '')}
                  onChange={(e) => setExerciseDraft((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Bench Press"
                />
                <Input
                  label="Sets"
                  type="number"
                  value={String(exerciseDraft.sets ?? 3)}
                  onChange={(e) => setExerciseDraft((p) => ({ ...p, sets: Number(e.target.value) }))}
                />
                <Input
                  label="Reps"
                  type="number"
                  value={String(exerciseDraft.reps ?? 10)}
                  onChange={(e) => setExerciseDraft((p) => ({ ...p, reps: Number(e.target.value) }))}
                />
                <Input
                  label="Rest (sec)"
                  type="number"
                  value={String(exerciseDraft.restPeriod ?? 60)}
                  onChange={(e) => setExerciseDraft((p) => ({ ...p, restPeriod: Number(e.target.value) }))}
                />
              </div>

              <div className="exercise-builder-grid" style={{ marginTop: 10 }}>
                <Input
                  label="YouTube URL (optional)"
                  value={String(exerciseDraft.videoURL || '')}
                  onChange={(e) => setExerciseDraft((p) => ({ ...p, videoURL: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  helpText={exerciseDraft.videoURL ? (embedUrl ? 'Preview available below.' : 'Invalid YouTube URL.') : undefined}
                />
                <Input
                  label="Instructions"
                  value={String(exerciseDraft.instructions || '')}
                  onChange={(e) => setExerciseDraft((p) => ({ ...p, instructions: e.target.value }))}
                  placeholder="Cues, tempo, breathing, etc."
                />
              </div>

              <div className="muscle-groups">
                <div className="muscle-groups-label">Muscle groups</div>
                <div className="muscle-groups-grid">
                  {MUSCLE_GROUPS.map((g) => {
                    const active = Array.isArray(exerciseDraft.muscleGroups) && exerciseDraft.muscleGroups.includes(g);
                    return (
                      <button
                        type="button"
                        key={g}
                        className={`chip ${active ? 'active' : ''}`}
                        onClick={() => toggleMuscleGroup(g)}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {embedUrl && (
                <div className="video-preview">
                  <iframe
                    title="YouTube preview"
                    src={embedUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="exercise-builder-actions">
                <Button variant="primary" onClick={addExerciseToDay}>
                  + Add to {selectedDay}
                </Button>
              </div>
            </div>

            <div className="schedule-days">
              {DAYS.map((day) => (
                <div key={day} className="day-block">
                  <div className="day-title">{day}</div>
                  {(() => {
                    const list = schedule[day] || [];
                    const filtered = list.filter((ex) => {
                      const matchesGroup = !filterMuscleGroup
                        ? true
                        : (ex.muscleGroups || []).includes(filterMuscleGroup);
                      const matchesSearch = !exerciseSearch
                        ? true
                        : `${ex.name} ${ex.instructions || ''}`
                            .toLowerCase()
                            .includes(exerciseSearch.toLowerCase());
                      return matchesGroup && matchesSearch;
                    });

                    if (filtered.length === 0) {
                      return <div className="empty-text">No exercises</div>;
                    }

                    return (
                      <div className="exercise-list">
                        {filtered.map((ex) => (
                          <div key={ex.id} className="exercise-item">
                            <div className="exercise-item-main">
                              <div className="exercise-name">{ex.name}</div>
                              <div className="exercise-meta">
                                {ex.sets}×{ex.reps} • Rest {ex.restPeriod}s
                                {ex.muscleGroups && ex.muscleGroups.length > 0 ? ` • ${ex.muscleGroups.join(', ')}` : ''}
                              </div>
                              {ex.videoURL && <div className="exercise-link">Video: {ex.videoURL}</div>}
                            </div>
                            <Button size="small" variant="ghost" onClick={() => removeExercise(day, ex.id)}>
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </Card>

          <Card title="Assign to Client" subtitle="Assign a published template to a client">
            {clientsLoading ? (
              <Loader />
            ) : clientsError ? (
              <div className="error-text">{clientsError}</div>
            ) : (
              <>
                {assignError && <div className="error-banner">{assignError}</div>}
                {assignSuccess && <div className="success-banner">{assignSuccess}</div>}

                <div className="form-grid">
                  <Select
                    label="Client"
                    options={[
                      { value: '', label: 'Select a client...' },
                      ...clients.map((c) => ({ value: c.id, label: c.fullName || c.email || c.id })),
                    ]}
                    value={assignClientId}
                    onChange={(e) => setAssignClientId(e.target.value)}
                  />
                  <Select
                    label="Template"
                    options={[
                      { value: '', label: 'Select a template...' },
                      ...templates
                        .filter((t) => t.status === 'published')
                        .map((t) => ({ value: t.id, label: t.name })),
                    ]}
                    value={selectedTemplateId || ''}
                    onChange={(e) => setSelectedTemplateId(e.target.value || null)}
                  />
                </div>
                <div className="template-actions">
                  <Button variant="success" onClick={handleAssign} loading={assigning}>
                    Assign Plan
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanner;

