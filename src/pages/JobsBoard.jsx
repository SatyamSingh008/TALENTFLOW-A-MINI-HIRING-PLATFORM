import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import JobModal from '../components/JobModal';
import DraggableJobList from '../components/DraggableJobList';
import { apiService } from '../services/api';

const JobsBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [error] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    tags: []
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });

  // Load jobs from API
  useEffect(() => {
    loadJobs();
  }, [filters, pagination.currentPage]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJobs({
        search: filters.search,
        status: filters.status,
        tags: filters.tags,
        page: pagination.currentPage,
        pageSize: pagination.itemsPerPage
      });
      
      setJobs(response.data);
      setPagination(prev => ({ ...prev, totalItems: response.pagination.total }));
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Job operations with API
  const handleCreateJob = async (jobData) => {
    try {
      const newJob = await apiService.createJob(jobData);
      setJobs(prev => [newJob, ...prev]);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowModal(true);
  };

  const handleUpdateJob = async (jobData) => {
    try {
      const updatedJob = await apiService.updateJob(editingJob.id, jobData);
      setJobs(prev => prev.map(job => 
        job.id === updatedJob.id ? updatedJob : job
      ));
      setShowModal(false);
      setEditingJob(null);
    } catch (error) {
      console.error('Failed to update job:', error);
    }
  };

  const handleArchiveJob = async (jobId) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      const updatedJob = await apiService.updateJob(jobId, { 
        status: job.status === 'archived' ? 'active' : 'archived' 
      });
      setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));
    } catch (error) {
      console.error('Failed to archive job:', error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await apiService.deleteJob(jobId);
      setJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const handleReorderJobs = async (reorderedJobs) => {
    try {
      // Update local state immediately for optimistic update
      setJobs(reorderedJobs);
      
      // Find the job that moved and its new position
      const movedJob = reorderedJobs.find((job, index) => 
        jobs.findIndex(j => j.id === job.id) !== index
      );
      
      if (movedJob) {
        const newIndex = reorderedJobs.findIndex(j => j.id === movedJob.id);
        const oldIndex = jobs.findIndex(j => j.id === movedJob.id);
        
        await apiService.reorderJobs(oldIndex + 1, newIndex + 1);
      }
    } catch (error) {
      console.error('Failed to reorder jobs:', error);
      // Revert on error
      loadJobs();
    }
  };

  const handleCreateJobClick = () => {
    setEditingJob(null);
    setShowModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Jobs Board</h1>
          <button
            onClick={handleCreateJobClick}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Add New Job
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search jobs, companies..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {['React', 'JavaScript', 'TypeScript', 'Node.js', 'Frontend', 'Remote'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.tags.includes(tag)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600 mb-4">
          Showing {pagination.totalItems} jobs
        </div>
      </div>

      {/* Draggable Jobs List */}
      <DraggableJobList
        jobs={jobs}
        onReorder={handleReorderJobs}
        onEdit={handleEditJob}
        onArchive={handleArchiveJob}
        onDelete={handleDeleteJob}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 border rounded-md ${
                page === pagination.currentPage
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Job Modal */}
      {showModal && (
        <JobModal
          job={editingJob}
          isOpen={showModal}
          onSave={editingJob ? handleUpdateJob : handleCreateJob}
          onClose={() => {
            setShowModal(false);
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
};

export default JobsBoard;
