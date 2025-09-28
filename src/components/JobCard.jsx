import React from 'react';
import { Link } from 'react-router-dom';

const JobCard = ({ job, onEdit, onArchive, onDelete }) => {
  const handleArchive = (e) => {
    e.preventDefault();
    onArchive(job.id);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this job?')) {
      onDelete(job.id);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    onEdit(job);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {job.title}
            </h3>
            <p className="text-gray-600 mb-1">{job.company}</p>
            <p className="text-sm text-gray-500">{job.location}</p>
          </div>
          <div className="flex space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              job.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {job.status}
            </span>
          </div>
        </div>

        {/* Job Details */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{job.type}</span>
            <span className="text-lg font-semibold text-indigo-600">{job.salary}</span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">{job.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {job.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Link
              to={`/jobs/${job.id}`}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              View Details
            </Link>
            <button
              onClick={handleEdit}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Edit
            </button>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={handleArchive}
              className="text-sm px-2 py-1 rounded hover:bg-gray-100"
              title={job.status === 'archived' ? 'Unarchive' : 'Archive'}
            >
              {job.status === 'archived' ? '📁' : '📂'}
            </button>
            <button
              onClick={handleDelete}
              className="text-sm px-2 py-1 rounded hover:bg-red-100 text-red-600"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Created Date */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Created: {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
