import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MentionsTextarea from '../components/MentionsTextarea';

const CandidateProfile = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [timeline, setTimeline] = useState([]);
  
  // Mock suggestions for @mentions
  const mentionSuggestions = [
    'John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson', 'David Brown',
    'Lisa Garcia', 'Chris Miller', 'Amy Davis', 'Tom Rodriguez', 'Emma Martinez',
    'HR Team', 'Technical Lead', 'Hiring Manager', 'Recruiter', 'Interview Panel'
  ];

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockCandidate = {
      id: parseInt(id),
      name: `Candidate ${id}`,
      email: `candidate${id}@email.com`,
      phone: `+1 (555) ${String(Math.floor(Math.random() * 9000) + 1000)}`,
      currentStage: 'Interview',
      appliedDate: '2024-01-15',
      experience: 5,
      skills: ['React', 'JavaScript', 'Node.js', 'TypeScript', 'MongoDB'],
      resumeUrl: '#',
      notes: 'Strong technical background with excellent communication skills.',
      jobId: 1,
      jobTitle: 'Senior React Developer',
      location: 'Boston, MA',
      salary: '$70K - $80K'
    };

    const mockTimeline = [
      {
        id: 1,
        stage: 'Applied',
        date: '2024-01-15',
        notes: 'Application submitted',
        user: 'System'
      },
      {
        id: 2,
        stage: 'Screening',
        date: '2024-01-16',
        notes: 'Initial screening completed - passed',
        user: 'HR Team'
      },
      {
        id: 3,
        stage: 'Interview',
        date: '2024-01-20',
        notes: 'Technical interview scheduled for next week',
        user: 'Technical Lead'
      }
    ];

    setCandidate(mockCandidate);
    setTimeline(mockTimeline);
    setNotes(mockCandidate.notes);
    setLoading(false);
  }, [id]);

  const handleStageChange = (newStage) => {
    if (candidate) {
      setCandidate(prev => ({ ...prev, currentStage: newStage }));
      
      // Add to timeline
      const newTimelineItem = {
        id: Date.now(),
        stage: newStage,
        date: new Date().toISOString().split('T')[0],
        notes: `Moved to ${newStage} stage`,
        user: 'Current User'
      };
      setTimeline(prev => [newTimelineItem, ...prev]);
    }
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = () => {
    if (candidate) {
      setCandidate(prev => ({ ...prev, notes }));
      
      // Add to timeline
      const newTimelineItem = {
        id: Date.now(),
        stage: candidate.currentStage,
        date: new Date().toISOString().split('T')[0],
        notes: 'Notes updated',
        user: 'Current User'
      };
      setTimeline(prev => [newTimelineItem, ...prev]);
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      'Applied': 'bg-blue-100 text-blue-800',
      'Screening': 'bg-yellow-100 text-yellow-800',
      'Interview': 'bg-purple-100 text-purple-800',
      'Offer': 'bg-green-100 text-green-800',
      'Hired': 'bg-emerald-100 text-emerald-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Candidate Not Found</h1>
          <p className="text-gray-600 mb-6">The candidate you're looking for doesn't exist.</p>
          <Link
            to="/candidates"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to Candidates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/candidates"
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Candidates
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-indigo-500 flex items-center justify-center mr-4">
                  <span className="text-white text-2xl font-bold">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
                  <p className="text-gray-600">{candidate.email}</p>
                  <p className="text-gray-500">{candidate.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(candidate.currentStage)}`}>
                    {candidate.currentStage}
                  </span>
                </div>
                <select
                  value={candidate.currentStage}
                  onChange={(e) => handleStageChange(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="Applied">Applied</option>
                  <option value="Screening">Screening</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Job Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Applied for:</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{candidate.jobTitle}</p>
                  <p className="text-sm text-gray-600">{candidate.location} • {candidate.salary}</p>
                </div>
                <Link
                  to={`/jobs/${candidate.jobId}`}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  View Job
                </Link>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
            <MentionsTextarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Add notes about this candidate... Use @ to mention team members"
              suggestions={mentionSuggestions}
            />
            <button
              onClick={handleSaveNotes}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Save Notes
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div key={item.id} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}></div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{item.stage}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                    <p className="text-sm text-gray-600">{item.notes}</p>
                    <p className="text-xs text-gray-400">by {item.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                📧 Send Email
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                📞 Schedule Call
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                📄 View Resume
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                📊 Assessment Results
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-600">{candidate.email}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm text-gray-600">{candidate.phone}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-600">
                  Applied {new Date(candidate.appliedDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
