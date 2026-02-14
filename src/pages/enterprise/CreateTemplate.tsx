import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Template } from '../../types';
import './CreateTemplate.css';

const CreateTemplate: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition'>('workout');
  const [viewMode, setViewMode] = useState<'published' | 'drafts'>('published');
  const navigate = useNavigate();
  const { user } = useAuth();
  const coachId = user?.uid || '';

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coachId) return;

    const templateType = activeTab === 'workout' ? 'workout' : 'nutrition';
    const q = query(
      collection(db, 'templates'),
      where('coachId', '==', coachId),
      where('type', '==', templateType),
      where('status', '==', viewMode === 'published' ? 'published' : 'draft')
    );

    setLoading(true);
    setError(null);

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Template[];
        setTemplates(list);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load templates', err);
        setError('Failed to load templates. Please refresh and try again.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [coachId, activeTab, viewMode]);

  const handleEdit = (templateId: string) => {
    const route = activeTab === 'workout' ? '/enterprise/workout-planner' : '/enterprise/diet-planner';
    navigate(`${route}?templateId=${templateId}`);
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Delete this template? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'templates', templateId));
    } catch (err) {
      console.error('Failed to delete template', err);
      alert('Failed to delete template.');
    }
  };

  return (
    <div className="create-template-page">
      <div className="page-header">
        <h1 className="page-title">Templates</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button 
            variant="secondary" 
            size="medium" 
            onClick={() => setViewMode(viewMode === 'published' ? 'drafts' : 'published')}
          >
            {viewMode === 'published' ? 'View Drafts' : 'View Published'}
          </Button>
          <Button 
            variant="secondary" 
            size="medium" 
            onClick={() => navigate(activeTab === 'workout' ? '/enterprise/workout-planner' : '/enterprise/diet-planner')}
            className="btn-new-template"
          >
            {activeTab === 'workout' ? '+ New Workout Template' : '+ New Diet Template'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'workout' ? 'active' : ''}`}
          onClick={() => setActiveTab('workout')}
        >
          Workout Templates
        </button>
        <button 
          className={`tab ${activeTab === 'nutrition' ? 'active' : ''}`}
          onClick={() => setActiveTab('nutrition')}
        >
          Nutrition Templates
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading templates...</div>}
        
        {error && <div style={{ color: '#dc2626', padding: '20px' }}>{error}</div>}
        
        {!loading && !error && templates.length === 0 && (
          <EmptyState
            title={`No ${viewMode === 'published' ? 'Published' : 'Draft'} Templates`}
            description={`You haven't created any ${viewMode === 'published' ? 'published' : 'draft'} ${activeTab} templates yet.`}
            action={{
              label: `Create ${activeTab === 'workout' ? 'Workout' : 'Diet'} Template`,
              onClick: () => navigate(activeTab === 'workout' ? '/enterprise/workout-planner' : '/enterprise/diet-planner')
            }}
          />
        )}

        {!loading && !error && templates.length > 0 && (
          <div className="templates-grid">
            {templates.map((template) => (
              <Card key={template.id} className="template-card">
                {/* Header with title and actions together */}
                <div className="template-card-header">
                  <div>
                    <h3 className="template-card-title">
                      {template.name}
                      <span className="template-card-meta">
                        <span>{template.duration} weeks</span>
                        <span>{template.difficulty}</span>
                      </span>
                    </h3>
                    <p className="template-card-description">{template.description}</p>
                  </div>
                  <div className="template-card-actions">
                    <Button variant="secondary" size="small" onClick={() => handleEdit(template.id)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="small" onClick={() => handleDelete(template.id)}>
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Secondary info */}
                <div className="template-card-date">
                  {template.updatedAt && (
                    <span>
                      {viewMode === 'published' ? 'Published' : 'Saved'}: {new Date(template.updatedAt.seconds * 1000).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTemplate;
