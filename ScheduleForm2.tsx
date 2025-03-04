import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Calendar, Clock, RefreshCw } from 'react-feather';
import Card from '../../common/Card';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Select from '../../common/Select';
import Alert from '../../common/Alert';
import Modal from '../../common/Modal';
import useApi from '../../../hooks/useApi';
import { getTemplates } from '../../../api/templateApi';
import { getSchedule, createSchedule, updateSchedule } from '../../../api/scheduleApi';
import './ScheduleForm.css';

// Interfaces for the component
interface Template {
  id: string;
  name: string;
}

interface ScheduleFormData {
  name: string;
  templateId: string;
  description?: string;
  outputFormat: string;
  rowCount: number;
  scheduleType: 'ONE_TIME' | 'RECURRING';
  nextRunTime?: string;
  cronExpression?: string;
  active: boolean;
}

const ScheduleForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState<ScheduleFormData>({
    name: '',
    templateId: '',
    description: '',
    outputFormat: 'CSV',
    rowCount: 100,
    scheduleType: 'ONE_TIME',
    nextRunTime: '',
    cronExpression: '',
    active: true
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // API hooks
  const {
    data: templatesData,
    isLoading: isLoadingTemplates,
    error: templatesError,
    execute: fetchTemplates
  } = useApi(getTemplates, [], { immediate: true });
  
  const {
    data: scheduleData,
    isLoading: isLoadingSchedule,
    error: scheduleError,
    execute: fetchSchedule
  } = useApi(getSchedule, isEditMode ? [id] : [], { immediate: isEditMode });
  
  const {
    isLoading: isSaving,
    error: saveError,
    execute: saveSchedule
  } = useApi(isEditMode ? updateSchedule : createSchedule);
  
  // Load schedule data if in edit mode
  useEffect(() => {
    if (isEditMode && scheduleData?.data) {
      const schedule = scheduleData.data;
      setFormData({
        name: schedule.name,
        templateId: schedule.templateId,
        description: schedule.description || '',
        outputFormat: schedule.outputFormat,
        rowCount: schedule.rowCount,
        scheduleType: schedule.cronExpression ? 'RECURRING' : 'ONE_TIME',
        nextRunTime: schedule.nextRunTime ? new Date(schedule.nextRunTime).toISOString().slice(0, 16) : '',
        cronExpression: schedule.cronExpression || '',
        active: schedule.active
      });
    }
  }, [isEditMode, scheduleData]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'number' ? parseInt(value, 10) : value
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.templateId) {
      errors.templateId = 'Template is required';
    }
    
    if (formData.rowCount <= 0) {
      errors.rowCount = 'Row count must be greater than 0';
    }
    
    if (formData.scheduleType === 'ONE_TIME' && !formData.nextRunTime) {
      errors.nextRunTime = 'Run time is required for one-time schedules';
    }
    
    if (formData.scheduleType === 'RECURRING' && !formData.cronExpression) {
      errors.cronExpression = 'Cron expression is required for recurring schedules';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare data for API
    const schedulePayload = {
      ...formData,
      id: isEditMode ? id : undefined,
      nextRunTime: formData.scheduleType === 'ONE_TIME' ? formData.nextRunTime : undefined,
      cronExpression: formData.scheduleType === 'RECURRING' ? formData.cronExpression : undefined
    };
    
    const response = await saveSchedule(schedulePayload);
    
    if (response.data) {
      navigate('/schedules');
    }
  };
  
  // Handle cancel button
  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/schedules/${id}`);
    } else {
      navigate('/schedules');
    }
  };
  
  // Predefined options for select dropdowns
  const templateOptions = templatesData?.data?.map((template: Template) => ({
    value: template.id,
    label: template.name
  })) || [];
  
  const outputFormatOptions = [
    { value: 'CSV', label: 'CSV' },
    { value: 'JSON', label: 'JSON' },
    { value: 'XML', label: 'XML' }
  ];
  
  const scheduleTypeOptions = [
    { value: 'ONE_TIME', label: 'One-time Schedule' },
    { value: 'RECURRING', label: 'Recurring Schedule' }
  ];
  
  // Common cron expression presets
  const cronPresets = [
    { label: 'Every day at midnight', value: '0 0 0 * * ?' },
    { label: 'Every hour', value: '0 0 * * * ?' },
    { label: 'Every Monday at 9am', value: '0 0 9 ? * MON' },
    { label: 'First day of month at 2am', value: '0 0 2 1 * ?' }
  ];
  
  const handleCronPresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      setFormData(prev => ({
        ...prev,
        cronExpression: e.target.value
      }));
    }
  };
  
  const isLoading = isLoadingTemplates || isLoadingSchedule;
  
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="schedule-form">
      <div className="template-form-header">
        <h1 className="jpm-page-title">
          {isEditMode ? 'Edit Schedule' : 'Create Schedule'}
        </h1>
        <div className="template-form-actions">
          <Button
            variant="outline"
            onClick={() => setShowConfirmModal(true)}
            leftIcon={<X size={16} />}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            leftIcon={<Save size={16} />}
            isLoading={isSaving}
          >
            {isEditMode ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </div>
      </div>
      
      {(templatesError || scheduleError || saveError) && (
        <Alert type="error" className="mb-4">
          {templatesError || scheduleError || saveError}
        </Alert>
      )}
      
      <Card>
        <Card.Header>
          <h2 className="form-section-title">Schedule Details</h2>
        </Card.Header>
        <Card.Body>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-column">
                <Input
                  label="Schedule Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={formErrors.name}
                  required
                />
                
                <Select
                  label="Template"
                  name="templateId"
                  value={formData.templateId}
                  onChange={handleInputChange}
                  options={templateOptions}
                  error={formErrors.templateId}
                  required
                  placeholder="Select a template..."
                />
                
                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea
                    className="jpm-input"
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-column">
                <div className="form-group">
                  <label className="form-label" htmlFor="outputFormat">Output Format</label>
                  <select
                    className="jpm-input"
                    id="outputFormat"
                    name="outputFormat"
                    value={formData.outputFormat}
                    onChange={handleInputChange}
                    required
                  >
                    {outputFormatOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label="Row Count"
                  name="rowCount"
                  value={formData.rowCount.toString()}
                  onChange={handleInputChange}
                  type="number"
                  min="1"
                  error={formErrors.rowCount}
                  required
                />
                
                <div className="form-group">
                  <label className="form-label" htmlFor="scheduleType">Schedule Type</label>
                  <select
                    className="jpm-input"
                    id="scheduleType"
                    name="scheduleType"
                    value={formData.scheduleType}
                    onChange={handleInputChange}
                    required
                  >
                    {scheduleTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="schedule-config-section">
              <h3 className="form-section-title">
                {formData.scheduleType === 'ONE_TIME' ? (
                  <>
                    <Calendar size={16} />
                    <span>One-time Schedule Configuration</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    <span>Recurring Schedule Configuration</span>
                  </>
                )}
              </h3>
              
              {formData.scheduleType === 'ONE_TIME' && (
                <div className="form-row">
                  <div className="form-column">
                    <Input
                      label="Run Date and Time"
                      name="nextRunTime"
                      value={formData.nextRunTime || ''}
                      onChange={handleInputChange}
                      type="datetime-local"
                      error={formErrors.nextRunTime}
                      required
                    />
                  </div>
                </div>
              )}
              
              {formData.scheduleType === 'RECURRING' && (
                <div className="form-row">
                  <div className="form-column">
                    <Input
                      label="Cron Expression"
                      name="cronExpression"
                      value={formData.cronExpression || ''}
                      onChange={handleInputChange}
                      error={formErrors.cronExpression}
                      required
                      placeholder="* * * * * ?"
                      helperText="Format: sec min hour day month day-of-week"
                    />
                  </div>
                  
                  <div className="form-column">
                    <div className="form-group">
                      <label className="form-label">Presets</label>
                      <select
                        className="jpm-input"
                        value=""
                        onChange={handleCronPresetSelect}
                      >
                        <option value="">Select a preset...</option>
                        {cronPresets.map(preset => (
                          <option key={preset.value} value={preset.value}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </Card.Body>
      </Card>
      
      <div className="form-footer">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowConfirmModal(true)}
        >
          Cancel
        </Button>
        
        <Button
          type="button"
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSaving}
        >
          {isEditMode ? 'Update Schedule' : 'Create Schedule'}
        </Button>
      </div>
      
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Cancel"
      >
        <p>Are you sure you want to cancel? Any unsaved changes will be lost.</p>
        <div className="modal-actions">
          <Button
            variant="outline"
            onClick={() => setShowConfirmModal(false)}
          >
            Continue Editing
          </Button>
          <Button
            variant="primary"
            onClick={handleCancel}
          >
            Discard Changes
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ScheduleForm;
