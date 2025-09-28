import React from 'react';

const AssessmentList = ({ assessments, onEdit, onDelete, onDuplicate }) => {
  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'archived': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getQuestionTypeIcon = (type) => {
    const icons = {
      'single-choice': '🔘',
      'multi-choice': '☑️',
      'short-text': '📝',
      'long-text': '📄',
      'numeric': '🔢',
      'file-upload': '📎'
    };
    return icons[type] || '❓';
  };

  return (
    <div className="space-y-6">
      {assessments.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assessments</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new assessment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {assessment.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{assessment.jobTitle}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                      {assessment.status}
                    </span>
                  </div>
                </div>

                {/* Question Types Preview */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Question Types:</p>
                  <div className="flex flex-wrap gap-1">
                    {assessment.questions.slice(0, 5).map((question, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        title={question.type}
                      >
                        {getQuestionTypeIcon(question.type)}
                      </span>
                    ))}
                    {assessment.questions.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{assessment.questions.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>{assessment.questions.length} questions</span>
                  <span>Created {new Date(assessment.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(assessment)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDuplicate(assessment)}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      Duplicate
                    </button>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onDelete(assessment.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-indigo-50 text-indigo-700 py-2 px-3 rounded text-sm hover:bg-indigo-100">
                      Preview
                    </button>
                    <button className="flex-1 bg-gray-50 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-100">
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentList;
