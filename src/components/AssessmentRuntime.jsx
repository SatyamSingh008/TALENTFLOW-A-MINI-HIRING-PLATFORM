import React, { useState, useEffect } from 'react';

const AssessmentRuntime = ({ assessment, onSubmit }) => {
  const [responses, setResponses] = useState({});
  const [visibleQuestions, setVisibleQuestions] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Initialize visible questions (only non-conditional ones initially)
    const initialVisible = assessment.questions.filter(q => !q.conditionalLogic?.enabled);
    setVisibleQuestions(initialVisible.map(q => q.id));
  }, [assessment]);

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    
    // Check conditional logic for other questions
    updateVisibleQuestions(questionId, value);
    
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: null }));
    }
  };

  const updateVisibleQuestions = (changedQuestionId, value) => {
    const newVisible = [...visibleQuestions];
    
    assessment.questions.forEach(question => {
      if (question.conditionalLogic?.enabled && question.conditionalLogic.dependsOn === changedQuestionId) {
        const shouldShow = evaluateCondition(question.conditionalLogic, value);
        
        if (shouldShow && !newVisible.includes(question.id)) {
          newVisible.push(question.id);
        } else if (!shouldShow && newVisible.includes(question.id)) {
          newVisible.splice(newVisible.indexOf(question.id), 1);
          // Clear response for hidden question
          setResponses(prev => {
            const newResponses = { ...prev };
            delete newResponses[question.id];
            return newResponses;
          });
        }
      }
    });
    
    setVisibleQuestions(newVisible);
  };

  const evaluateCondition = (conditionalLogic, value) => {
    const { condition, value: expectedValue } = conditionalLogic;
    
    switch (condition) {
      case 'equals':
        return value === expectedValue;
      case 'not_equals':
        return value !== expectedValue;
      case 'contains':
        return value && value.toString().toLowerCase().includes(expectedValue.toLowerCase());
      default:
        return false;
    }
  };

  const validateResponses = () => {
    const newErrors = {};
    let isValid = true;

    visibleQuestions.forEach(questionId => {
      const question = assessment.questions.find(q => q.id === questionId);
      const response = responses[questionId];

      if (question.required && (!response || response === '')) {
        newErrors[questionId] = 'This question is required';
        isValid = false;
      }

      if (question.type === 'numeric' && response) {
        const numValue = parseFloat(response);
        if (isNaN(numValue) || numValue < question.min || numValue > question.max) {
          newErrors[questionId] = `Please enter a number between ${question.min} and ${question.max}`;
          isValid = false;
        }
      }

      if ((question.type === 'short-text' || question.type === 'long-text') && response) {
        if (response.length > question.maxLength) {
          newErrors[questionId] = `Maximum length is ${question.maxLength} characters`;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateResponses()) {
      onSubmit(responses);
    }
  };

  const renderQuestion = (question) => {
    if (!visibleQuestions.includes(question.id)) return null;

    return (
      <div key={question.id} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {question.question}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        
        {question.type === 'single-choice' && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={responses[question.id] === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
        
        {question.type === 'multi-choice' && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  checked={responses[question.id]?.includes(option) || false}
                  onChange={(e) => {
                    const currentValues = responses[question.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    handleResponseChange(question.id, newValues);
                  }}
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
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Your answer..."
            maxLength={question.maxLength}
          />
        )}
        
        {question.type === 'long-text' && (
          <textarea
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Your answer..."
            maxLength={question.maxLength}
          />
        )}
        
        {question.type === 'numeric' && (
          <input
            type="number"
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            min={question.min}
            max={question.max}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={`Enter a number between ${question.min} and ${question.max}`}
          />
        )}
        
        {question.type === 'file-upload' && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              onChange={(e) => handleResponseChange(question.id, e.target.files[0])}
              className="hidden"
              id={`file-${question.id}`}
            />
            <label
              htmlFor={`file-${question.id}`}
              className="cursor-pointer"
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
            </label>
          </div>
        )}

        {errors[question.id] && (
          <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{assessment.title}</h1>
        <p className="text-gray-600 mb-8">Job: {assessment.jobTitle}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {assessment.questions.map(renderQuestion)}
          
          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 text-lg font-medium"
            >
              Submit Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentRuntime;
