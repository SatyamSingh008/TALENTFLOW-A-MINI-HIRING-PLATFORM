import React, { useState, useEffect } from 'react';

const AssessmentBuilder = ({ assessment, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    jobId: '',
    jobTitle: '',
    questions: []
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    if (assessment) {
      setFormData({
        title: assessment.title || '',
        jobId: assessment.jobId || '',
        jobTitle: assessment.jobTitle || '',
        questions: assessment.questions || []
      });
    }
  }, [assessment]);

  const questionTypes = [
    { value: 'single-choice', label: 'Single Choice' },
    { value: 'multi-choice', label: 'Multiple Choice' },
    { value: 'short-text', label: 'Short Text' },
    { value: 'long-text', label: 'Long Text' },
    { value: 'numeric', label: 'Numeric' },
    { value: 'file-upload', label: 'File Upload' }
  ];

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'single-choice',
      question: '',
      options: ['', ''],
      required: true,
      correctAnswer: 0,
      correctAnswers: [],
      min: 0,
      max: 100,
      maxLength: 100,
      conditionalLogic: {
        enabled: false,
        dependsOn: null,
        condition: 'equals',
        value: ''
      }
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setEditingQuestion(newQuestion.id);
  };

  const updateQuestion = (questionId, updates) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const deleteQuestion = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
    setEditingQuestion(null);
  };

  const duplicateQuestion = (questionId) => {
    const question = formData.questions.find(q => q.id === questionId);
    if (question) {
      const duplicatedQuestion = {
        ...question,
        id: Date.now(),
        question: `${question.question} (Copy)`
      };
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, duplicatedQuestion]
      }));
    }
  };

  const moveQuestion = (questionId, direction) => {
    const questions = [...formData.questions];
    const index = questions.findIndex(q => q.id === questionId);
    
    if (direction === 'up' && index > 0) {
      [questions[index], questions[index - 1]] = [questions[index - 1], questions[index]];
    } else if (direction === 'down' && index < questions.length - 1) {
      [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]];
    }
    
    setFormData(prev => ({ ...prev, questions }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('Please enter a title for the assessment');
      return;
    }
    
    if (formData.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    onSave(formData);
  };

  const renderQuestionForm = (question) => {
    return (
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Question {formData.questions.indexOf(question) + 1}</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => moveQuestion(question.id, 'up')}
              className="text-gray-500 hover:text-gray-700"
              disabled={formData.questions.indexOf(question) === 0}
            >
              ↑
            </button>
            <button
              onClick={() => moveQuestion(question.id, 'down')}
              className="text-gray-500 hover:text-gray-700"
              disabled={formData.questions.indexOf(question) === formData.questions.length - 1}
            >
              ↓
            </button>
            <button
              onClick={() => duplicateQuestion(question.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              📋
            </button>
            <button
              onClick={() => deleteQuestion(question.id)}
              className="text-red-500 hover:text-red-700"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Question Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
          <select
            value={question.type}
            onChange={(e) => updateQuestion(question.id, { type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {questionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Question Text */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
          <textarea
            value={question.question}
            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your question..."
          />
        </div>

        {/* Options for choice questions */}
        {(question.type === 'single-choice' || question.type === 'multi-choice') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options];
                    newOptions[index] = e.target.value;
                    updateQuestion(question.id, { options: newOptions });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  onClick={() => {
                    const newOptions = question.options.filter((_, i) => i !== index);
                    updateQuestion(question.id, { options: newOptions });
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                  disabled={question.options.length <= 2}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newOptions = [...question.options, ''];
                updateQuestion(question.id, { options: newOptions });
              }}
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              + Add Option
            </button>
          </div>
        )}

        {/* Numeric range */}
        {question.type === 'numeric' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum</label>
              <input
                type="number"
                value={question.min}
                onChange={(e) => updateQuestion(question.id, { min: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum</label>
              <input
                type="number"
                value={question.max}
                onChange={(e) => updateQuestion(question.id, { max: parseInt(e.target.value) || 100 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Max length for text questions */}
        {(question.type === 'short-text' || question.type === 'long-text') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Length</label>
            <input
              type="number"
              value={question.maxLength}
              onChange={(e) => updateQuestion(question.id, { maxLength: parseInt(e.target.value) || 100 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Required checkbox */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">Required question</label>
        </div>

        {/* Conditional Logic */}
        <div className="border-t pt-4">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={question.conditionalLogic?.enabled || false}
              onChange={(e) => updateQuestion(question.id, { 
                conditionalLogic: { 
                  ...question.conditionalLogic, 
                  enabled: e.target.checked 
                } 
              })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Show this question conditionally</label>
          </div>

          {question.conditionalLogic?.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Depends on</label>
                <select
                  value={question.conditionalLogic?.dependsOn || ''}
                  onChange={(e) => updateQuestion(question.id, { 
                    conditionalLogic: { 
                      ...question.conditionalLogic, 
                      dependsOn: e.target.value 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select question...</option>
                  {formData.questions
                    .filter(q => q.id !== question.id && (q.type === 'single-choice' || q.type === 'multi-choice'))
                    .map(q => (
                      <option key={q.id} value={q.id}>
                        {q.question || 'Untitled Question'}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={question.conditionalLogic?.condition || 'equals'}
                  onChange={(e) => updateQuestion(question.id, { 
                    conditionalLogic: { 
                      ...question.conditionalLogic, 
                      condition: e.target.value 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="equals">Equals</option>
                  <option value="not_equals">Not equals</option>
                  <option value="contains">Contains</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                <input
                  type="text"
                  value={question.conditionalLogic?.value || ''}
                  onChange={(e) => updateQuestion(question.id, { 
                    conditionalLogic: { 
                      ...question.conditionalLogic, 
                      value: e.target.value 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Answer value..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    return (
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{formData.title}</h2>
        <p className="text-gray-600 mb-6">Job: {formData.jobTitle}</p>
        
        <form className="space-y-6">
          {formData.questions.map((question, index) => (
            <div key={question.id} className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {index + 1}. {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              
              {question.type === 'single-choice' && (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {question.type === 'multi-choice' && (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {question.type === 'short-text' && (
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your answer..."
                  maxLength={question.maxLength}
                />
              )}
              
              {question.type === 'long-text' && (
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your answer..."
                  maxLength={question.maxLength}
                />
              )}
              
              {question.type === 'numeric' && (
                <input
                  type="number"
                  min={question.min}
                  max={question.max}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={`Enter a number between ${question.min} and ${question.max}`}
                />
              )}
              
              {question.type === 'file-upload' && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                </div>
              )}
            </div>
          ))}
          
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Submit Assessment
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {assessment ? 'Edit Assessment' : 'Create New Assessment'}
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save Assessment
            </button>
          </div>
        </div>
      </div>

      {previewMode ? (
        renderPreview()
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Builder */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Assessment Details</h2>
            
            {/* Basic Info */}
            <div className="bg-white border rounded-lg p-4 mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Assessment title..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Job title this assessment is for..."
                />
              </div>
            </div>

            {/* Questions */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
                <button
                  onClick={addQuestion}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  + Add Question
                </button>
              </div>
              
              {formData.questions.map(question => (
                <div key={question.id}>
                  {editingQuestion === question.id ? (
                    renderQuestionForm(question)
                  ) : (
                    <div className="bg-white border rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {question.question || 'Untitled Question'}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">{question.type}</p>
                          {question.required && (
                            <span className="text-xs text-red-500">Required</span>
                          )}
                        </div>
                        <button
                          onClick={() => setEditingQuestion(question.id)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Live Preview</h2>
            {renderPreview()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentBuilder;
