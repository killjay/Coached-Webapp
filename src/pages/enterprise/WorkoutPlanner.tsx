import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Step state
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Field errors for validation
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    description: false,
    durationWeeks: false,
  });

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
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [dayMuscleGroups, setDayMuscleGroups] = useState<Record<string, string[]>>({});

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

  // Load template from URL parameter
  useEffect(() => {
    const templateId = searchParams.get('templateId');
    if (templateId && templates.length > 0) {
      setSelectedTemplateId(templateId);
      setCurrentStep(2);
    }
  }, [searchParams, templates]);

  const templateTagList = useMemo(() => {
    return tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }, [tags]);

  // Auto-expand the selected day when it changes
  useEffect(() => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      next.add(selectedDay);
      return next;
    });
  }, [selectedDay]);

  const handleNextStep = () => {
    // Clear previous errors
    const errors = {
      name: !name.trim(),
      description: !description.trim(),
      durationWeeks: !durationWeeks || durationWeeks < 1,
    };

    setFieldErrors(errors);

    // If any errors, don't proceed
    if (errors.name || errors.description || errors.durationWeeks) {
      return;
    }

    // All valid, proceed to step 2
    setCurrentStep(2);
  };

  const validateTemplate = (skipExerciseCheck: boolean = false) => {
    if (!coachId) return 'You must be logged in.';
    if (!name.trim()) return 'Template name is required.';
    if (!skipExerciseCheck) {
      const totalExercises = Object.values(schedule).reduce((sum, list) => sum + (list?.length || 0), 0);
      if (totalExercises === 0) return 'Add at least one exercise to the schedule.';
    }
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
    
    // Update day muscle groups immediately
    setDayMuscleGroups((prev) => {
      const currentDayGroups = prev[selectedDay] || [];
      const nextDayGroups = currentDayGroups.includes(group) 
        ? currentDayGroups.filter((g) => g !== group) 
        : [...currentDayGroups, group];
      return { ...prev, [selectedDay]: nextDayGroups };
    });
  };

  const toggleDay = (day: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFieldErrors({ name: false, description: false, durationWeeks: false });
    setSelectedTemplateId(null);
    setName('');
    setDescription('');
    setDifficulty('beginner');
    setDurationWeeks(8);
    setStatus('draft');
    setTags('');
    setSelectedDay('Monday');
    setSchedule(emptySchedule());
    setDayMuscleGroups({});
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

  const handleSave = async (nextStatus: TemplateStatus, skipExerciseCheck: boolean = false) => {
    setSaveError(null);
    setAssignSuccess(null);

    const validationError = validateTemplate(skipExerciseCheck);
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
      
      // Navigate to templates page after publishing
      if (nextStatus === 'published') {
        navigate('/enterprise/templates');
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
    <>
      <div className="workout-planner-page">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {currentStep === 2 && (
                <Button variant="ghost" size="medium" onClick={() => setCurrentStep(1)}>
                  ← Back
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {currentStep === 2 && (
                <Button variant="secondary" onClick={() => handleSave('draft')} loading={saving} className="btn-save-drafts">
                  Save to Drafts
                </Button>
              )}
              {currentStep === 2 && (
                <Button key="save-publish-header" variant="success" onClick={() => handleSave('published')} loading={saving}>
                  Publish
                </Button>
              )}
            </div>
          </div>
          <div className="page-header">
            <div>
              <h1 className="page-title">Workout Planner</h1>
            </div>
          </div>
        </div>

      <div className="workout-planner-grid">
        <div className="editor-panel">
          {currentStep === 1 && (
            <>
            <Card title="Template Details">
              <div className="form-grid">
                <Input
                  label="Template Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: false });
                  }}
                  placeholder="e.g., Strength Split (8 weeks)"
                  required
                  error={fieldErrors.name ? 'Required' : undefined}
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
                  onChange={(e) => {
                    setDurationWeeks(Number(e.target.value));
                    if (fieldErrors.durationWeeks) setFieldErrors({ ...fieldErrors, durationWeeks: false });
                  }}
                  placeholder="8"
                  error={fieldErrors.durationWeeks ? 'Required (min 1)' : undefined}
                />
                <Input
                  label="Tags (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="strength, hypertrophy, beginner"
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <div className={`input-wrapper ${fieldErrors.description ? 'has-error' : ''}`}>
                  <label className="input-label">Description</label>
                  <div className="input-container">
                    <textarea
                      className={`input textarea-input ${fieldErrors.description ? 'input-error' : ''}`}
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: false });
                      }}
                      placeholder="Short description for coaches/clients"
                      rows={4}
                    />
                  </div>
                  {fieldErrors.description && <span className="input-error-text">Required</span>}
                </div>
              </div>

              <div className="template-actions">
                <Button variant="secondary" onClick={() => handleSave('draft', true)} disabled={saving}>
                  Save Draft
                </Button>
                <Button variant="primary" onClick={handleNextStep}>
                  Next
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
            </>
          )}

          {currentStep === 2 && (
            <div className="step-2-layout">
            {/* Toolbar - Top Left */}
            <Card>
            <div className="schedule-toolbar">
              <Select
                label="Day"
                options={DAYS.map((d) => ({ value: d, label: d }))}
                value={selectedDay}
                onChange={(e) => {
                  const newDay = e.target.value as any;
                  setSelectedDay(newDay);
                  setExpandedDays(new Set([newDay]));
                  // Load the muscle groups that were previously selected for this day
                  const dayGroups = dayMuscleGroups[newDay] || [];
                  setExerciseDraft((prev) => ({ ...prev, muscleGroups: dayGroups }));
                }}
              />
            </div>

            <div className="muscle-groups">
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
          </Card>

            {/* Weekly Schedule - Right Side (spans 2 rows) */}
            <div className="schedule-days">
              {DAYS.map((day) => {
                const isExpanded = expandedDays.has(day);
                const dayExercises = schedule[day] || [];
                const exerciseMuscleGroups = Array.from(
                  new Set(
                    dayExercises.flatMap((ex) => ex.muscleGroups || [])
                  )
                );
                // Combine immediate selections with exercise muscle groups
                const immediateMuscleGroups = dayMuscleGroups[day] || [];
                const allMuscleGroups = Array.from(
                  new Set([...immediateMuscleGroups, ...exerciseMuscleGroups])
                );
                return (
                  <div key={day} className={`day-block ${isExpanded ? 'expanded' : ''}`}>
                    <div className="day-title" onClick={() => toggleDay(day)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>{day}</span>
                        {allMuscleGroups.length > 0 && (
                          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 400 }}>
                            • {allMuscleGroups.join(', ')}
                          </span>
                        )}
                      </div>
                      <svg 
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          transition: 'transform 0.2s', 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          color: '#9ca3af',
                          flexShrink: 0
                        }} 
                        viewBox="0 0 20 20" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {isExpanded && (() => {
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
                            <div key={ex.id} className="exercise-item" style={{ position: 'relative' }}>
                              <button
                                onClick={() => removeExercise(day, ex.id)}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#9ca3af',
                                transition: 'color 0.2s',
                              }}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              <div className="exercise-item-main">
                                <div className="exercise-name">{ex.name}</div>
                                <div className="exercise-meta">
                                  {ex.sets}×{ex.reps} • Rest {ex.restPeriod}s
                                </div>
                                {ex.videoURL && <div className="exercise-link">{ex.videoURL}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

          {/* Exercise Builder - Bottom Left */}
          <Card>
          <div className="exercise-builder">
            <Input
              label="Exercise name"
              value={String(exerciseDraft.name || '')}
              onChange={(e) => setExerciseDraft((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Bench Press"
            />
            
            <div className="exercise-builder-grid" style={{ marginTop: 10, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
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

            <div style={{ marginTop: 10 }}>
              <Input
                label="YouTube URL (optional)"
                value={String(exerciseDraft.videoURL || '')}
                onChange={(e) => setExerciseDraft((p) => ({ ...p, videoURL: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
                helpText={exerciseDraft.videoURL ? (embedUrl ? 'Preview available below.' : 'Invalid YouTube URL.') : undefined}
              />
            </div>
            
            <div style={{ marginTop: 10 }}>
              <div className="input-wrapper">
                <label className="input-label">Instructions</label>
                <div className="input-container">
                  <textarea
                    className="input textarea-input"
                    value={String(exerciseDraft.instructions || '')}
                    onChange={(e) => setExerciseDraft((p) => ({ ...p, instructions: e.target.value }))}
                    placeholder="Cues, tempo, breathing, etc."
                    rows={3}
                  />
                </div>
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
                Add to {selectedDay}
              </Button>
            </div>
          </div>
          </Card>
          </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default WorkoutPlanner;

