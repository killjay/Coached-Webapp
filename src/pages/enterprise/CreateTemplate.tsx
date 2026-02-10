import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { UI_MESSAGES } from '../../constants';
import './CreateTemplate.css';

const CreateTemplate: React.FC = () => {
  const [templateType, setTemplateType] = useState<'workout' | 'nutrition' | 'combined'>('workout');
  const [templateName, setTemplateName] = useState('');
  const [exercises, setExercises] = useState([
    { name: 'Squats', sets: 3, reps: 12, rest: 60 },
  ]);

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: 10, rest: 60 }]);
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const newExercises = [...exercises];
    (newExercises[index] as any)[field] = value;
    setExercises(newExercises);
  };

  const handleSave = () => {
    alert(UI_MESSAGES.TEMPLATE.SUCCESS);
  };

  return (
    <div className="create-template-page">
      <div className="page-header">
        <h1 className="page-title">Create Template</h1>
        <p className="page-description">Build workout and nutrition templates</p>
      </div>

      <Card title="Template Details">
        <div className="form-grid">
          <Input
            label="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="My Workout Plan"
          />
          <Select
            label="Template Type"
            options={[
              { value: 'workout', label: 'Workout Plan' },
              { value: 'nutrition', label: 'Nutrition Plan' },
              { value: 'combined', label: 'Combined Program' },
            ]}
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value as any)}
          />
          <Select
            label="Difficulty Level"
            options={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
          />
          <Input
            label="Duration (weeks)"
            type="number"
            placeholder="8"
          />
        </div>
      </Card>

      {templateType === 'workout' && (
        <Card title="Exercises" subtitle="Add exercises to your workout plan">
          {exercises.map((exercise, index) => (
            <div key={index} className="exercise-row">
              <Input
                placeholder="Exercise name"
                value={exercise.name}
                onChange={(e) => updateExercise(index, 'name', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Sets"
                value={exercise.sets}
                onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Reps"
                value={exercise.reps}
                onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Rest (sec)"
                value={exercise.rest}
                onChange={(e) => updateExercise(index, 'rest', parseInt(e.target.value))}
              />
            </div>
          ))}
          <Button variant="secondary" onClick={addExercise}>
            + Add Exercise
          </Button>
        </Card>
      )}

      <div className="template-actions">
        <Button variant="secondary">Save as Draft</Button>
        <Button variant="success" onClick={handleSave}>
          Publish Template
        </Button>
      </div>
    </div>
  );
};

export default CreateTemplate;
