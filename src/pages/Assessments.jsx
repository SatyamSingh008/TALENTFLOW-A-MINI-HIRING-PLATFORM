import React, { useState, useEffect } from "react";
import AssessmentList from "../components/AssessmentList";
import AssessmentBuilder from "../components/AssessmentBuilder";
import { dbHelpers } from "../db/database";

// Mock starter data
const mockAssessments = [
  {
    id: 1,
    title: "React Developer Assessment",
    jobId: 1,
    jobTitle: "Senior React Developer",
    questions: [
      { id: 1, type: "single-choice", question: "What is the primary purpose of React hooks?" },
      { id: 2, type: "multi-choice", question: "Which of the following are React lifecycle methods?" },
      { id: 3, type: "short-text", question: "What is JSX?" },
      { id: 4, type: "long-text", question: "Explain the difference between controlled and uncontrolled components." },
      { id: 5, type: "numeric", question: "How many years of React experience do you have?" },
    ],
    createdAt: "2024-01-15",
    status: "active",
  },
  {
    id: 2,
    title: "JavaScript Fundamentals",
    jobId: 2,
    jobTitle: "Frontend Engineer",
    questions: [
      { id: 1, type: "single-choice", question: "What is the difference between let and var?" },
      { id: 2, type: "short-text", question: "What is closure in JavaScript?" },
      { id: 3, type: "long-text", question: "Explain the concept of prototypal inheritance." },
    ],
    createdAt: "2024-01-14",
    status: "draft",
  },
];

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state (legacy create modal removed)

  // Builder state
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);

  // Load from IndexedDB
  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      // Get all assessments from all jobs
      const allAssessments = [];
      for (let jobId = 1; jobId <= 25; jobId++) {
        const jobAssessments = await dbHelpers.getAssessments(jobId);
        allAssessments.push(...jobAssessments);
      }
      setAssessments(allAssessments);
    } catch (error) {
      console.error('Failed to load assessments:', error);
      setAssessments(mockAssessments);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateBuilder = () => {
    setEditingAssessment(null);
    setShowBuilder(true);
  };
  // removed unused helpers and legacy create handler

  const handleSaveAssessment = async (data) => {
    try {
      if (editingAssessment) {
        const updatedAssessment = await dbHelpers.updateAssessment(editingAssessment.id, data);
        setAssessments(prev => prev.map(a => a.id === editingAssessment.id ? updatedAssessment : a));
      } else {
        const newAssessment = await dbHelpers.createAssessment({
          title: data.title,
          jobId: data.jobId || 1,
          questions: data.questions || []
        });
        setAssessments(prev => [newAssessment, ...prev]);
      }
      setShowBuilder(false);
      setEditingAssessment(null);
    } catch (error) {
      console.error('Failed to save assessment:', error);
    }
  };

  const handleEditAssessment = (assessment) => {
    setEditingAssessment(assessment);
    setShowBuilder(true);
  };

  const handleDeleteAssessment = async (id) => {
    try {
      await dbHelpers.deleteAssessment(id);
      setAssessments(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete assessment:', error);
    }
  };

  const handleDuplicateAssessment = async (assessment) => {
    try {
      const duplicated = await dbHelpers.createAssessment({
        title: `${assessment.title} (Copy)`,
        jobId: assessment.jobId,
        questions: assessment.questions
      });
      setAssessments(prev => [duplicated, ...prev]);
    } catch (error) {
      console.error('Failed to duplicate assessment:', error);
    }
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
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
          <button
            onClick={handleOpenCreateBuilder}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Create New Assessment
          </button>
        </div>

        <p className="text-gray-600">
          Create and manage assessments for your job postings. Build custom questionnaires to
          evaluate candidates' skills and knowledge.
        </p>
      </div>

      {/* Assessments List */}
      <AssessmentList
        assessments={assessments}
        onEdit={handleEditAssessment}
        onDelete={handleDeleteAssessment}
        onDuplicate={handleDuplicateAssessment}
      />

      {/* Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4">
            <AssessmentBuilder
              assessment={editingAssessment}
              onSave={handleSaveAssessment}
              onCancel={() => { setShowBuilder(false); setEditingAssessment(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessments;
