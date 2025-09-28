// API service layer with optimistic updates and error handling
class ApiService {
  constructor() {
    this.baseURL = '/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Jobs API
  async getJobs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    console.log('🔍 API: Getting jobs with params:', params);
    const result = await this.request(`/jobs?${queryString}`);
    console.log('📊 API: Jobs response:', result);
    return result;
  }

  async createJob(jobData) {
    return this.request('/jobs', {
      method: 'POST',
      body: jobData,
    });
  }

  async updateJob(id, updates) {
    return this.request(`/jobs/${id}`, {
      method: 'PATCH',
      body: updates,
    });
  }

  async deleteJob(id) {
    return this.request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderJobs(fromOrder, toOrder) {
    return this.request(`/jobs/reorder`, {
      method: 'PATCH',
      body: { fromOrder, toOrder },
    });
  }

  // Candidates API
  async getCandidates(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    console.log('🔍 API: Getting candidates with params:', params);
    const result = await this.request(`/candidates?${queryString}`);
    console.log('📊 API: Candidates response:', result);
    return result;
  }

  async createCandidate(candidateData) {
    return this.request('/candidates', {
      method: 'POST',
      body: candidateData,
    });
  }

  async updateCandidate(id, updates) {
    return this.request(`/candidates/${id}`, {
      method: 'PATCH',
      body: updates,
    });
  }

  async updateCandidateStage(id, stage) {
    return this.request(`/candidates/${id}/stage`, {
      method: 'PATCH',
      body: { stage },
    });
  }

  async getCandidateTimeline(id) {
    return this.request(`/candidates/${id}/timeline`);
  }

  // Assessments API
  async getAssessments(jobId) {
    return this.request(`/assessments/${jobId}`);
  }

  async createAssessment(jobId, assessmentData) {
    return this.request(`/assessments/${jobId}`, {
      method: 'PUT',
      body: assessmentData,
    });
  }

  async updateAssessment(id, updates) {
    return this.request(`/assessments/${id}`, {
      method: 'PATCH',
      body: updates,
    });
  }

  async deleteAssessment(id) {
    return this.request(`/assessments/${id}`, {
      method: 'DELETE',
    });
  }

  async submitAssessmentResponse(assessmentId, candidateId, responses) {
    return this.request(`/assessments/${assessmentId}/submit`, {
      method: 'POST',
      body: { candidateId, responses },
    });
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Optimistic update utilities
export const optimisticUpdates = {
  // Jobs
  addJob: (jobs, newJob) => [newJob, ...jobs],
  
  updateJob: (jobs, updatedJob) => 
    jobs.map(job => job.id === updatedJob.id ? { ...job, ...updatedJob } : job),
  
  deleteJob: (jobs, jobId) => 
    jobs.filter(job => job.id !== jobId),
  
  reorderJobs: (jobs, fromIndex, toIndex) => {
    const newJobs = [...jobs];
    const [movedJob] = newJobs.splice(fromIndex, 1);
    newJobs.splice(toIndex, 0, movedJob);
    return newJobs;
  },

  // Candidates
  addCandidate: (candidates, newCandidate) => [newCandidate, ...candidates],
  
  updateCandidate: (candidates, updatedCandidate) => 
    candidates.map(candidate => 
      candidate.id === updatedCandidate.id 
        ? { ...candidate, ...updatedCandidate } 
        : candidate
    ),
  
  updateCandidateStage: (candidates, candidateId, stage) => 
    candidates.map(candidate => 
      candidate.id === candidateId 
        ? { 
            ...candidate, 
            stage,
            timeline: [
              ...(candidate.timeline || []),
              {
                id: Date.now(),
                stage,
                date: new Date().toISOString().split('T')[0],
                notes: `Moved to ${stage} stage`,
                user: 'Current User'
              }
            ]
          }
        : candidate
    ),

  // Assessments
  addAssessment: (assessments, newAssessment) => [newAssessment, ...assessments],
  
  updateAssessment: (assessments, updatedAssessment) => 
    assessments.map(assessment => 
      assessment.id === updatedAssessment.id 
        ? { ...assessment, ...updatedAssessment } 
        : assessment
    ),
  
  deleteAssessment: (assessments, assessmentId) => 
    assessments.filter(assessment => assessment.id !== assessmentId)
};

// Error handling utilities
export const errorHandlers = {
  handleApiError: (error, context = '') => {
    console.error(`API Error in ${context}:`, error);
    
    // You could integrate with a toast notification system here
    if (error.message.includes('Network error')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (error.message.includes('500')) {
      return 'Server error. Please try again later.';
    }
    
    return error.message || 'An unexpected error occurred.';
  },

  isRetryableError: (error) => {
    return error.message.includes('Network error') || 
           error.message.includes('500') ||
           error.message.includes('timeout');
  }
};

export default apiService;
