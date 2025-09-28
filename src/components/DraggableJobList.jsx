import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableJobItem = ({ job, onEdit, onDelete, onArchive }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow-sm border p-6 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{job.company}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>📍 {job.location}</span>
            <span>💰 {job.salary}</span>
            <span>📅 {job.type}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            job.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {job.status}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {job.tags?.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(job)}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onArchive(job.id)}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            {job.status === 'active' ? 'Archive' : 'Unarchive'}
          </button>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onDelete(job.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

const DraggableJobList = ({ jobs, onReorder, onEdit, onDelete, onArchive }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = jobs.findIndex(job => job.id === active.id);
      const newIndex = jobs.findIndex(job => job.id === over.id);
      
      const reorderedJobs = arrayMove(jobs, oldIndex, newIndex);
      onReorder(reorderedJobs);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {jobs.map((job) => (
            <SortableJobItem
              key={job.id}
              job={job}
              onEdit={onEdit}
              onDelete={onDelete}
              onArchive={onArchive}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DraggableJobList;
