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
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { ClientProfile, TemplateMeal, Template, TemplateAssignment, NutritionPlan, DayMeals } from '../../types';
import './DietPlanner.css';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type TemplateStatus = 'draft' | 'published';
type MealType = 'breakfast' | 'morning-snack' | 'lunch' | 'evening-snack' | 'dinner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const MEAL_TYPES: MealType[] = ['breakfast', 'morning-snack', 'lunch', 'evening-snack', 'dinner'];

function safeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const emptyDayMeals = (): DayMeals => ({
  breakfast: [],
  'morning-snack': [],
  lunch: [],
  'evening-snack': [],
  dinner: [],
});

const emptyMeals = (): NutritionPlan['meals'] =>
  DAYS.reduce((acc, day) => {
    acc[day] = emptyDayMeals();
    return acc;
  }, {} as NutritionPlan['meals']);

const DietPlanner: React.FC = () => {
  const { user } = useAuth();
  const coachId = user?.uid || '';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
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
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [meals, setMeals] = useState<NutritionPlan['meals']>(emptyMeals());
  const [macroTargets, setMacroTargets] = useState({
    protein: 150,
    carbs: 200,
    fats: 60,
    calories: 2000,
  });

  const [mealDraft, setMealDraft] = useState<Partial<TemplateMeal>>({
    name: '',
    ingredients: [],
    instructions: '',
    macros: {
      protein: 0,
      carbs: 0,
      fats: 0,
      calories: 0,
    },
  });

  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredientWeight, setIngredientWeight] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [assignClientId, setAssignClientId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const coachTemplatesQuery = useMemo(() => {
    if (!coachId) return null;
    return query(collection(db, 'templates'), where('coachId', '==', coachId), where('type', '==', 'nutrition'));
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

    const content = selectedTemplate.content as NutritionPlan;
    const nextMeals = content?.meals ? { ...emptyMeals(), ...content.meals } : emptyMeals();
    setMeals(nextMeals);
    if (content?.macroTargets) {
      setMacroTargets(content.macroTargets);
    }
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

  useEffect(() => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      next.add(selectedDay);
      return next;
    });
  }, [selectedDay]);

  const handleNextStep = () => {
    const errors = {
      name: !name.trim(),
      description: !description.trim(),
      durationWeeks: !durationWeeks || durationWeeks < 1,
    };

    setFieldErrors(errors);

    if (errors.name || errors.description || errors.durationWeeks) {
      return;
    }

    setCurrentStep(2);
  };

  const validateTemplate = (skipMealCheck: boolean = false) => {
    if (!coachId) return 'You must be logged in.';
    if (!name.trim()) return 'Template name is required.';
    if (!skipMealCheck) {
      const totalMeals = Object.values(meals).reduce(
        (sum, dayMeals) =>
          sum +
          (dayMeals?.breakfast?.length || 0) +
          (dayMeals?.['morning-snack']?.length || 0) +
          (dayMeals?.lunch?.length || 0) +
          (dayMeals?.['evening-snack']?.length || 0) +
          (dayMeals?.dinner?.length || 0),
        0
      );
      if (totalMeals === 0) return 'Add at least one meal to the plan.';
    }
    return null;
  };

  const addIngredient = () => {
    const ingredient = ingredientInput.trim();
    if (!ingredient) return;
    
    const weight = ingredientWeight.trim();
    const ingredientText = weight ? `${ingredient} (${weight}g)` : ingredient;
    
    setMealDraft((prev) => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), ingredientText],
    }));
    setIngredientInput('');
    setIngredientWeight('');
  };

  const removeIngredient = (index: number) => {
    setMealDraft((prev) => ({
      ...prev,
      ingredients: (prev.ingredients || []).filter((_, i) => i !== index),
    }));
  };

  const addMealToDay = () => {
    const n = (mealDraft.name || '').trim();
    if (!n) return;

    const meal: TemplateMeal = {
      id: safeId(),
      name: n,
      ingredients: Array.isArray(mealDraft.ingredients) ? mealDraft.ingredients : [],
      instructions: String(mealDraft.instructions || ''),
      macros: {
        protein: Number(mealDraft.macros?.protein || 0),
        carbs: Number(mealDraft.macros?.carbs || 0),
        fats: Number(mealDraft.macros?.fats || 0),
        calories: Number(mealDraft.macros?.calories || 0),
      },
    };

    setMeals((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [selectedMealType]: [...(prev[selectedDay]?.[selectedMealType] || []), meal],
      },
    }));

    setMealDraft({
      name: '',
      ingredients: [],
      instructions: '',
      macros: {
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0,
      },
    });
  };

  const removeMeal = (day: string, mealType: MealType, mealId: string) => {
    setMeals((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: (prev[day]?.[mealType] || []).filter((m) => m.id !== mealId),
      },
    }));
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
    setSelectedMealType('breakfast');
    setMeals(emptyMeals());
    setMacroTargets({
      protein: 150,
      carbs: 200,
      fats: 60,
      calories: 2000,
    });
    setMealDraft({
      name: '',
      ingredients: [],
      instructions: '',
      macros: {
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0,
      },
    });
    setSaveError(null);
    setAssignClientId('');
    setAssignError(null);
    setAssignSuccess(null);
  };

  const handleSave = async (nextStatus: TemplateStatus, skipMealCheck: boolean = false) => {
    setSaveError(null);
    setAssignSuccess(null);

    const validationError = validateTemplate(skipMealCheck);
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
        type: 'nutrition',
        difficulty,
        duration: Number(durationWeeks) || 8,
        content: { meals, macroTargets } as NutritionPlan,
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

  return (
    <>
      <div className="diet-planner-page">
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
              <h1 className="page-title">Diet Planner</h1>
            </div>
          </div>
        </div>

        <div className="diet-planner-grid">
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
                      placeholder="e.g., High Protein Diet (8 weeks)"
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
                      placeholder="high-protein, low-carb, muscle-gain"
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
                      }}
                    />
                    <Select
                      label="Meal Type"
                      options={MEAL_TYPES.map((m) => {
                        const labels: Record<MealType, string> = {
                          'breakfast': 'Breakfast',
                          'morning-snack': 'Morning Snack',
                          'lunch': 'Lunch',
                          'evening-snack': 'Evening Snack',
                          'dinner': 'Dinner'
                        };
                        return { value: m, label: labels[m] };
                      })}
                      value={selectedMealType}
                      onChange={(e) => setSelectedMealType(e.target.value as MealType)}
                    />
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <label className="input-label">Daily Macro Targets</label>
                    <div className="macro-grid">
                      <Input
                        label="Protein (g)"
                        type="number"
                        value={String(macroTargets.protein)}
                        onChange={(e) => setMacroTargets((p) => ({ ...p, protein: Number(e.target.value) }))}
                      />
                      <Input
                        label="Carbs (g)"
                        type="number"
                        value={String(macroTargets.carbs)}
                        onChange={(e) => setMacroTargets((p) => ({ ...p, carbs: Number(e.target.value) }))}
                      />
                      <Input
                        label="Fats (g)"
                        type="number"
                        value={String(macroTargets.fats)}
                        onChange={(e) => setMacroTargets((p) => ({ ...p, fats: Number(e.target.value) }))}
                      />
                      <Input
                        label="Calories"
                        type="number"
                        value={String(macroTargets.calories)}
                        onChange={(e) => setMacroTargets((p) => ({ ...p, calories: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                </Card>

                <div className="schedule-days">
                  {DAYS.map((day) => {
                    const isExpanded = expandedDays.has(day);
                    const dayMeals = meals[day] || emptyDayMeals();
                    const totalMeals =
                      (dayMeals.breakfast?.length || 0) +
                      (dayMeals['morning-snack']?.length || 0) +
                      (dayMeals.lunch?.length || 0) +
                      (dayMeals['evening-snack']?.length || 0) +
                      (dayMeals.dinner?.length || 0);

                    return (
                      <div key={day} className={`day-block ${isExpanded ? 'expanded' : ''}`}>
                        <div className="day-title" onClick={() => toggleDay(day)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span>{day}</span>
                            {totalMeals > 0 && (
                              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 400 }}>
                                • {totalMeals} meal{totalMeals !== 1 ? 's' : ''}
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
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(4, 1fr)', 
                          gap: '8px', 
                          marginTop: '12px',
                          padding: '8px',
                          background: '#f9fafb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}>
                          <div>
                            <div style={{ color: '#6b7280', marginBottom: '2px' }}>Protein</div>
                            <div style={{ fontWeight: 600, color: '#111827' }}>{macroTargets.protein}g</div>
                          </div>
                          <div>
                            <div style={{ color: '#6b7280', marginBottom: '2px' }}>Carbs</div>
                            <div style={{ fontWeight: 600, color: '#111827' }}>{macroTargets.carbs}g</div>
                          </div>
                          <div>
                            <div style={{ color: '#6b7280', marginBottom: '2px' }}>Fats</div>
                            <div style={{ fontWeight: 600, color: '#111827' }}>{macroTargets.fats}g</div>
                          </div>
                          <div>
                            <div style={{ color: '#6b7280', marginBottom: '2px' }}>Calories</div>
                            <div style={{ fontWeight: 600, color: '#111827' }}>{macroTargets.calories}</div>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="meal-sections">
                            {MEAL_TYPES.map((mealType) => {
                              const mealList = dayMeals[mealType] || [];
                              if (mealList.length === 0) return null;

                              return (
                                <div key={mealType} className="meal-section">
                                  <div className="meal-section-title">
                                    {(() => {
                                      const labels: Record<MealType, string> = {
                                        'breakfast': 'Breakfast',
                                        'morning-snack': 'Morning Snack',
                                        'lunch': 'Lunch',
                                        'evening-snack': 'Evening Snack',
                                        'dinner': 'Dinner'
                                      };
                                      return labels[mealType];
                                    })()}
                                  </div>
                                  <div className="meal-list">
                                    {mealList.map((meal) => (
                                      <div key={meal.id} className="meal-item" style={{ position: 'relative' }}>
                                        <button
                                          onClick={() => removeMeal(day, mealType, meal.id)}
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
                                        <div className="meal-name">{meal.name}</div>
                                        {meal.ingredients.length > 0 && (
                                          <ol className="meal-ingredients">
                                            {meal.ingredients.map((ingredient, idx) => (
                                              <li key={idx}>{ingredient}</li>
                                            ))}
                                          </ol>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                            {totalMeals === 0 && <div className="empty-text">No meals</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Card>
                  <div className="meal-builder">
                    <Input
                      label="Meal name"
                      value={String(mealDraft.name || '')}
                      onChange={(e) => setMealDraft((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g., Grilled Chicken Salad"
                    />

                    <div style={{ marginTop: 10 }}>
                      <label className="input-label">Ingredients</label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <Input
                          value={ingredientInput}
                          onChange={(e) => setIngredientInput(e.target.value)}
                          placeholder="Add ingredient"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addIngredient();
                            }
                          }}
                        />
                        <Input
                          type="number"
                          value={ingredientWeight}
                          onChange={(e) => setIngredientWeight(e.target.value)}
                          placeholder="Weight (g)"
                          style={{ width: '120px' }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addIngredient();
                            }
                          }}
                        />
                        <Button variant="secondary" onClick={addIngredient}>
                          Add
                        </Button>
                      </div>
                      {(mealDraft.ingredients || []).length > 0 && (
                        <div className="ingredients-list">
                          {(mealDraft.ingredients || []).map((ing, idx) => (
                            <div key={idx} className="ingredient-chip">
                              <span>{ing}</span>
                              <button onClick={() => removeIngredient(idx)}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <div className="input-wrapper">
                        <label className="input-label">Instructions</label>
                        <div className="input-container">
                          <textarea
                            className="input textarea-input"
                            value={String(mealDraft.instructions || '')}
                            onChange={(e) => setMealDraft((p) => ({ ...p, instructions: e.target.value }))}
                            placeholder="Preparation instructions..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="meal-builder-actions">
                      <Button variant="primary" onClick={addMealToDay}>
                        Add to {selectedDay} - {(() => {
                          const labels: Record<MealType, string> = {
                            'breakfast': 'Breakfast',
                            'morning-snack': 'Morning Snack',
                            'lunch': 'Lunch',
                            'evening-snack': 'Evening Snack',
                            'dinner': 'Dinner'
                          };
                          return labels[selectedMealType];
                        })()}
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

export default DietPlanner;
