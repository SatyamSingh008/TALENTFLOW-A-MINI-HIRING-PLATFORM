import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import AssessmentRuntime from '../components/AssessmentRuntime';

const JobDetails = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      
      // Load job details
      const jobsResponse = await apiService.getJobs();
      const jobData = jobsResponse.data.find(j => j.id === parseInt(jobId));
      setJob(jobData);

      // Load assessments for this job
      const assessmentsResponse = await apiService.getAssessments(jobId);
      setAssessments(assessmentsResponse);

      // Load candidates for this job
      const candidatesResponse = await apiService.getCandidates({ jobId: parseInt(jobId) });
      setCandidates(candidatesResponse.data);

    } catch (error) {
      console.error('Failed to load job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setShowAssessment(true);
  };

  const handleAssessmentSubmit = async (responses) => {
    try {
      await apiService.submitAssessmentResponse(selectedAssessment.id, 1, responses);
      alert('Assessment submitted successfully!');
      setShowAssessment(false);
      setSelectedAssessment(null);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist.</p>
          <Link
            to="/jobs"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (showAssessment && selectedAssessment) {
    return (
      <AssessmentRuntime
        assessment={selectedAssessment}
        onSubmit={handleAssessmentSubmit}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/jobs"
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
      {/* Job Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <p className="text-xl text-gray-600 mb-4">{job.company}</p>
                <div className="flex items-center space-x-6 text-gray-500">
                  <span>📍 {job.location}</span>
                  <span>💰 {job.salary}</span>
                  <span>📅 {job.type}</span>
                </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              job.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {job.status}
            </span>
          </div>
        </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {job.tags?.map((tag, index) => (
            <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
            </span>
          ))}
      </div>

            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </div>
          </div>

          {/* Assessments */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessments</h2>
            {assessments.length === 0 ? (
              <p className="text-gray-500">No assessments available for this job.</p>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {assessment.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {assessment.questions?.length || 0} questions
                    </p>
                    <button
                      onClick={() => handleStartAssessment(assessment)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Start Assessment
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Stats */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Candidates</span>
                <span className="font-semibold">{candidates.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Assessments</span>
                <span className="font-semibold">{assessments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-semibold capitalize">{job.status}</span>
              </div>
            </div>
          </div>

          {/* Recent Candidates */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Candidates</h3>
            <div className="space-y-3">
              {candidates.slice(0, 5).map((candidate) => (
                <div key={candidate.id} className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-medium">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <Link
                      to={`/candidates/${candidate.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {candidate.name}
                    </Link>
                    <p className="text-xs text-gray-500">{candidate.stage}</p>
                  </div>
                </div>
              ))}
              {candidates.length > 5 && (
                <Link
                  to="/candidates"
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  View all {candidates.length} candidates →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;