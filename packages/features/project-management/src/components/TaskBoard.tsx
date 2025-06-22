import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  MoreHorizontal, 
  User, 
  Calendar, 
  Clock, 
  Flag,
  MessageSquare,
  Paperclip
} from 'lucide-react';
import { format } from 'date-fns';
import { useProjectManagementStore } from '../stores';
import type { Task, ViewMode } from '../types';

interface TaskBoardProps {
  projectId: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

interface TaskCardProps {
  task: Task;
  onTaskClick: (taskId: string) => void;
}

interface DroppableColumnProps {
  column: Column;
  onTaskDrop: (taskId: string, newStatus: string) => void;
  onTaskClick: (taskId: string) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return '#ef4444';
    case 'high':
      return '#f97316';
    case 'medium':
      return '#eab308';
    case 'low':
      return '#22c55e';
    default:
      return '#6b7280';
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return '🔥';
    case 'high':
      return '⬆️';
    case 'medium':
      return '➡️';
    case 'low':
      return '⬇️';
    default:
      return '';
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskClick }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      onClick={() => onTaskClick(task.id)}
      className={`p-3 mb-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{
        backgroundColor: 'var(--color-background)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span 
            className="text-xs font-mono px-2 py-1 rounded"
            style={{ 
              backgroundColor: 'var(--color-backgroundSecondary)',
              color: 'var(--color-foregroundSecondary)' 
            }}
          >
            {task.key}
          </span>
          <span className="text-xs">{getPriorityIcon(task.priority)}</span>
        </div>
        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Task Title */}
      <h4 
        className="text-sm font-medium mb-2 line-clamp-2"
        style={{ color: 'var(--color-foreground)' }}
      >
        {task.title}
      </h4>

      {/* Task Meta */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-foregroundSecondary)' }}>
        <div className="flex items-center space-x-3">
          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-center space-x-1">
              <User size={12} />
              <span>{task.assignee}</span>
            </div>
          )}

          {/* Due Date */}
          {task.due_date && (
            <div className="flex items-center space-x-1">
              <Calendar size={12} />
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
            </div>
          )}

          {/* Estimate */}
          {task.estimate && (
            <div className="flex items-center space-x-1">
              <Clock size={12} />
              <span>{task.estimate}h</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Comments */}
          {task.comments.length > 0 && (
            <div className="flex items-center space-x-1">
              <MessageSquare size={12} />
              <span>{task.comments.length}</span>
            </div>
          )}

          {/* Attachments */}
          {task.attachments.length > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip size={12} />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.labels.slice(0, 3).map((label, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--color-backgroundSecondary)',
                color: 'var(--color-foregroundSecondary)',
              }}
            >
              {label}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--color-backgroundSecondary)',
                color: 'var(--color-foregroundSecondary)',
              }}
            >
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Priority Indicator */}
      <div 
        className="w-full h-1 rounded-full mt-3"
        style={{ backgroundColor: getPriorityColor(task.priority) }}
      />
    </div>
  );
};

const DroppableColumn: React.FC<DroppableColumnProps> = ({ column, onTaskDrop, onTaskClick }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item: { id: string; status: string }) => {
      if (item.status !== column.id) {
        onTaskDrop(item.id, column.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-80 max-w-80 ${isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
    >
      {/* Column Header */}
      <div 
        className="p-4 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-medium" style={{ color: 'var(--color-foreground)' }}>
            {column.title}
          </h3>
          <span 
            className="text-sm px-2 py-1 rounded-full"
            style={{
              backgroundColor: 'var(--color-backgroundSecondary)',
              color: 'var(--color-foregroundSecondary)',
            }}
          >
            {column.tasks.length}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div className="p-4 h-[calc(100vh-200px)] overflow-y-auto">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onTaskClick={onTaskClick}
          />
        ))}
        
        {column.tasks.length === 0 && (
          <div 
            className="text-center py-8 text-sm"
            style={{ color: 'var(--color-foregroundSecondary)' }}
          >
            No tasks in {column.title.toLowerCase()}
          </div>
        )}
      </div>
    </div>
  );
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ projectId }) => {
  const {
    tasks,
    currentProject,
    viewMode,
    setSelectedTask,
    updateTask,
    loadTasks,
  } = useProjectManagementStore();

  const [columns, setColumns] = useState<Column[]>([]);

  useEffect(() => {
    if (currentProject) {
      const statuses = currentProject.settings.workflow_states;
      const statusColors: Record<string, string> = {
        'todo': '#6b7280',
        'in_progress': '#3b82f6',
        'in_review': '#f59e0b',
        'done': '#10b981',
        'blocked': '#ef4444',
      };

      const newColumns: Column[] = statuses.map(status => ({
        id: status,
        title: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        color: statusColors[status] || '#6b7280',
        tasks: tasks.filter(task => task.status === status),
      }));

      setColumns(newColumns);
    }
  }, [tasks, currentProject]);

  const handleTaskDrop = async (taskId: string, newStatus: string) => {
    try {
      await updateTask(projectId, taskId, { status: newStatus });
      // Reload tasks to get updated data
      await loadTasks(projectId);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTask(taskId);
  };

  if (!currentProject) {
    return <div>Loading...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full w-full">
        {/* View Mode Selector */}
        <div 
          className="p-4 border-b flex items-center space-x-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            View:
          </span>
          <div className="flex rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
            {(['kanban', 'list', 'calendar'] as const).map((mode) => (
              <button
                key={mode}
                className={`px-3 py-1 text-sm capitalize transition-colors ${
                  viewMode.type === mode
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                style={{ 
                  color: viewMode.type === mode ? 'white' : 'var(--color-foreground)' 
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Kanban Board */}
        {viewMode.type === 'kanban' && (
          <div className="flex h-full overflow-x-auto">
            {columns.map((column) => (
              <DroppableColumn
                key={column.id}
                column={column}
                onTaskDrop={handleTaskDrop}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode.type === 'list' && (
          <div className="p-4">
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task.id)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm" style={{ color: 'var(--color-foregroundSecondary)' }}>
                        {task.key}
                      </span>
                      <span className="font-medium" style={{ color: 'var(--color-foreground)' }}>
                        {task.title}
                      </span>
                      <span 
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: 'var(--color-backgroundSecondary)',
                          color: 'var(--color-foregroundSecondary)',
                        }}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm" style={{ color: 'var(--color-foregroundSecondary)' }}>
                      {task.assignee && (
                        <div className="flex items-center space-x-1">
                          <User size={14} />
                          <span>{task.assignee}</span>
                        </div>
                      )}
                      {task.due_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      <Flag size={14} style={{ color: getPriorityColor(task.priority) }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar View */}
        {viewMode.type === 'calendar' && (
          <div className="p-4 text-center" style={{ color: 'var(--color-foregroundSecondary)' }}>
            Calendar view coming soon...
          </div>
        )}
      </div>
    </DndProvider>
  );
};