import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Search,
  RefreshCw,
  Calendar
} from 'react-feather';
import Card from '../../common/Card';
import Button from '../../common/Button';
import Table from '../../common/Table';
import Alert from '../../common/Alert';
import Badge from '../../common/Badge';
import Modal from '../../common/Modal';
import Input from '../../common/Input';
import useApi from '../../../hooks/useApi';
import { 
  getSchedules, 
  activateSchedule, 
  pauseSchedule, 
  deleteSchedule 
} from '../../../api/scheduleApi';
import './ScheduleList.css';

// Interfaces
interface Schedule {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ERROR';
  scheduleType: 'ONE_TIME' | 'RECURRING';
  nextRunTime: string;
  lastRunTime?: string;
  cronExpression?: string;
  outputFormat: string;
  rowCount: number;
}

const ScheduleList: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // API hooks
  const {
    data: schedulesData,
    isLoading,
    error,
    execute: fetchSchedules
  } = useApi(getSchedules, [{ page: currentPage, size: pageSize, search: searchTerm, status: statusFilter }], { 
    immediate: true 
  });
  
  const {
    isLoading: isActivating,
    error: activateError,
    execute: executeActivate
  } = useApi(activateSchedule);
  
  const {
    isLoading: isPausing,
    error: pauseError,
    execute: executePause
  } = useApi(pauseSchedule);
  
  const {
    isLoading: isDeleting,
    error: deleteError,
    execute: executeDelete
  } = useApi(deleteSchedule);
  
  // Refresh schedules when page, filters change
  useEffect(() => {
    fetchSchedules({ page: currentPage, size: pageSize, search: searchTerm, status: statusFilter });
  }, [currentPage, pageSize, searchTerm, statusFilter, fetchSchedules]);
  
  // Action handlers
  const handleActivate = async (schedule: Schedule) => {
    const response = await executeActivate(schedule.id);
    if (response.data) {
      fetchSchedules({ page: currentPage, size: pageSize, search: searchTerm, status: statusFilter });
    }
  };
  
  const handlePause = async (schedule: Schedule) => {
    const response = await executePause(schedule.id);
    if (response.data) {
      fetchSchedules({ page: currentPage, size: pageSize, search: searchTerm, status: statusFilter });
    }
  };
  
  const handleDeleteClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (selectedSchedule) {
      const response = await executeDelete(selectedSchedule.id);
      if (response.data) {
        setShowDeleteModal(false);
        fetchSchedules({ page: currentPage, size: pageSize, search: searchTerm, status: statusFilter });
      }
    }
  };
  
  const handleEditClick = (schedule: Schedule) => {
    navigate(`/schedules/${schedule.id}/edit`);
  };
  
  const handleViewClick = (schedule: Schedule) => {
    navigate(`/schedules/${schedule.id}`);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset to first page on search
  };
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(0); // Reset to first page on filter change
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PAUSED':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      case 'ERROR':
        return 'danger';
      default:
        return 'default';
    }
  };
  
  // Table columns
  const columns = [
    {
      header: 'Schedule Name',
      accessor: 'name',
      cell: (schedule: Schedule) => (
        <Link to={`/schedules/${schedule.id}`} className="schedule-name-link">
          {schedule.name}
        </Link>
      )
    },
    {
      header: 'Template',
      accessor: 'templateName'
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (schedule: Schedule) => (
        <Badge color={getStatusBadgeColor(schedule.status)}>
          {schedule.status}
        </Badge>
      )
    },
    {
      header: 'Type',
      accessor: 'scheduleType',
      cell: (schedule: Schedule) => (
        <div className="schedule-type">
          {schedule.scheduleType === 'ONE_TIME' ? (
            <>
              <Calendar size={14} />
              <span>One-time</span>
            </>
          ) : (
            <>
              <RefreshCw size={14} />
              <span>Recurring</span>
            </>
          )}
        </div>
      )
    },
    {
      header: 'Next Run',
      accessor: 'nextRunTime',
      cell: (schedule: Schedule) => formatDate(schedule.nextRunTime)
    },
    {
      header: 'Last Run',
      accessor: 'lastRunTime',
      cell: (schedule: Schedule) => schedule.lastRunTime ? formatDate(schedule.lastRunTime) : 'Never'
    },
    {
      header: 'Format',
      accessor: 'outputFormat',
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (schedule: Schedule) => (
        <div className="actions-cell">
          <button
            className="icon-button"
            onClick={() => handleViewClick(schedule)}
            title="View details"
          >
            <Eye size={16} />
          </button>
          <button
            className="icon-button"
            onClick={() => handleEditClick(schedule)}
            title="Edit schedule"
          >
            <Edit size={16} />
          </button>
          
          {schedule.status === 'ACTIVE' ? (
            <button
              className="icon-button"
              onClick={() => handlePause(schedule)}
              disabled={isPausing}
              title="Pause schedule"
            >
              <Pause size={16} />
            </button>
          ) : (
            <button
              className="icon-button"
              onClick={() => handleActivate(schedule)}
              disabled={isActivating || schedule.status === 'COMPLETED'}
              title="Activate schedule"
            >
              <Play size={16} />
            </button>
          )}
          
          <button
            className="icon-button delete"
            onClick={() => handleDeleteClick(schedule)}
            title="Delete schedule"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];
  
  // Get aggregated error message
  const aggregatedError = error || activateError || pauseError || deleteError;
  
  return (
    <div className="schedule-list">
      <div className="template-form-header">
        <h1 className="jpm-page-title">Generation Schedules</h1>
        <div className="template-form-actions">
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/schedules/new')}
          >
            Create Schedule
          </Button>
        </div>
      </div>
      
      {aggregatedError && (
        <Alert type="error" className="mb-4">
          {aggregatedError}
        </Alert>
      )}
      
      <Card>
        <Card.Header>
          <div className="filters">
            <div className="search-container">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            
            <div className="status-filter">
              <select 
                value={statusFilter} 
                onChange={handleStatusFilterChange}
                className="jpm-input"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="COMPLETED">Completed</option>
                <option value="ERROR">Error</option>
              </select>
            </div>
          </div>
        </Card.Header>
        
        <Card.Body>
          <Table
            columns={columns}
            data={schedulesData?.data?.content || []}
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages: schedulesData?.data?.totalPages || 1,
              totalItems: schedulesData?.data?.totalElements || 0,
              pageSize,
              onPageChange: setCurrentPage,
              onPageSizeChange: setPageSize
            }}
            emptyMessage="No schedules found"
          />
        </Card.Body>
      </Card>
      
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <p>
          Are you sure you want to delete the schedule "{selectedSchedule?.name}"? 
          This action cannot be undone.
        </p>
        <div className="modal-actions">
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            isLoading={isDeleting}
          >
            Delete Schedule
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ScheduleList;
