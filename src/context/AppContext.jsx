import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Initial state
const initialState = {
  jobs: [],
  candidates: [],
  assessments: [],
  ui: {
    loading: false,
    error: null,
    modals: {
      jobModal: false,
      assessmentModal: false
    }
  },
  filters: {
    jobs: {
      search: '',
      status: 'all',
      tags: []
    },
    candidates: {
      search: '',
      stage: 'all'
    }
  },
  pagination: {
    jobs: { currentPage: 1, itemsPerPage: 10, totalItems: 0 },
    candidates: { currentPage: 1, itemsPerPage: 20, totalItems: 0 }
  }
};

// Action types
const ActionTypes = {
  // Jobs
  SET_JOBS: 'SET_JOBS',
  ADD_JOB: 'ADD_JOB',
  UPDATE_JOB: 'UPDATE_JOB',
  DELETE_JOB: 'DELETE_JOB',
  ARCHIVE_JOB: 'ARCHIVE_JOB',
  REORDER_JOBS: 'REORDER_JOBS',
  
  // Candidates
  SET_CANDIDATES: 'SET_CANDIDATES',
  UPDATE_CANDIDATE: 'UPDATE_CANDIDATE',
  UPDATE_CANDIDATE_STAGE: 'UPDATE_CANDIDATE_STAGE',
  ADD_CANDIDATE_NOTE: 'ADD_CANDIDATE_NOTE',
  
  // Assessments
  SET_ASSESSMENTS: 'SET_ASSESSMENTS',
  ADD_ASSESSMENT: 'ADD_ASSESSMENT',
  UPDATE_ASSESSMENT: 'UPDATE_ASSESSMENT',
  DELETE_ASSESSMENT: 'DELETE_ASSESSMENT',
  
  // UI
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  TOGGLE_MODAL: 'TOGGLE_MODAL',
  
  // Filters
  UPDATE_FILTERS: 'UPDATE_FILTERS',
  
  // Pagination
  UPDATE_PAGINATION: 'UPDATE_PAGINATION',
  
  // Optimistic updates
  OPTIMISTIC_UPDATE: 'OPTIMISTIC_UPDATE',
  ROLLBACK_UPDATE: 'ROLLBACK_UPDATE'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_JOBS:
      return {
        ...state,
        jobs: action.payload,
        pagination: {
          ...state.pagination,
          jobs: {
            ...state.pagination.jobs,
            totalItems: action.payload.length
          }
        }
      };

    case ActionTypes.ADD_JOB:
      return {
        ...state,
        jobs: [action.payload, ...state.jobs],
        pagination: {
          ...state.pagination,
          jobs: {
            ...state.pagination.jobs,
            totalItems: state.pagination.jobs.totalItems + 1
          }
        }
      };

    case ActionTypes.UPDATE_JOB:
      return {
        ...state,
        jobs: state.jobs.map(job =>
          job.id === action.payload.id ? { ...job, ...action.payload } : job
        )
      };

    case ActionTypes.DELETE_JOB:
      return {
        ...state,
        jobs: state.jobs.filter(job => job.id !== action.payload),
        pagination: {
          ...state.pagination,
          jobs: {
            ...state.pagination.jobs,
            totalItems: state.pagination.jobs.totalItems - 1
          }
        }
      };

    case ActionTypes.ARCHIVE_JOB:
      return {
        ...state,
        jobs: state.jobs.map(job =>
          job.id === action.payload
            ? { ...job, status: job.status === 'archived' ? 'active' : 'archived' }
            : job
        )
      };

    case ActionTypes.REORDER_JOBS:
      return {
        ...state,
        jobs: action.payload
      };

    case ActionTypes.SET_CANDIDATES:
      return {
        ...state,
        candidates: action.payload,
        pagination: {
          ...state.pagination,
          candidates: {
            ...state.pagination.candidates,
            totalItems: action.payload.length
          }
        }
      };

    case ActionTypes.UPDATE_CANDIDATE:
      return {
        ...state,
        candidates: state.candidates.map(candidate =>
          candidate.id === action.payload.id ? { ...candidate, ...action.payload } : candidate
        )
      };

    case ActionTypes.UPDATE_CANDIDATE_STAGE:
      return {
        ...state,
        candidates: state.candidates.map(candidate =>
          candidate.id === action.payload.id
            ? { 
                ...candidate, 
                currentStage: action.payload.stage,
                timeline: [
                  ...(candidate.timeline || []),
                  {
                    id: Date.now(),
                    stage: action.payload.stage,
                    date: new Date().toISOString().split('T')[0],
                    notes: `Moved to ${action.payload.stage} stage`,
                    user: 'Current User'
                  }
                ]
              }
            : candidate
        )
      };

    case ActionTypes.ADD_CANDIDATE_NOTE:
      return {
        ...state,
        candidates: state.candidates.map(candidate =>
          candidate.id === action.payload.candidateId
            ? {
                ...candidate,
                notes: action.payload.notes,
                timeline: [
                  ...(candidate.timeline || []),
                  {
                    id: Date.now(),
                    stage: candidate.currentStage,
                    date: new Date().toISOString().split('T')[0],
                    notes: 'Notes updated',
                    user: 'Current User'
                  }
                ]
              }
            : candidate
        )
      };

    case ActionTypes.SET_ASSESSMENTS:
      return {
        ...state,
        assessments: action.payload
      };

    case ActionTypes.ADD_ASSESSMENT:
      return {
        ...state,
        assessments: [action.payload, ...state.assessments]
      };

    case ActionTypes.UPDATE_ASSESSMENT:
      return {
        ...state,
        assessments: state.assessments.map(assessment =>
          assessment.id === action.payload.id ? { ...assessment, ...action.payload } : assessment
        )
      };

    case ActionTypes.DELETE_ASSESSMENT:
      return {
        ...state,
        assessments: state.assessments.filter(assessment => assessment.id !== action.payload)
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload }
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        ui: { ...state.ui, error: action.payload }
      };

    case ActionTypes.TOGGLE_MODAL:
      return {
        ...state,
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            [action.payload.modal]: action.payload.isOpen
          }
        }
      };

    case ActionTypes.UPDATE_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.type]: {
            ...state.filters[action.payload.type],
            ...action.payload.filters
          }
        }
      };

    case ActionTypes.UPDATE_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          [action.payload.type]: {
            ...state.pagination[action.payload.type],
            ...action.payload.pagination
          }
        }
      };

    case ActionTypes.OPTIMISTIC_UPDATE:
      return {
        ...state,
        [action.payload.entity]: action.payload.optimisticData
      };

    case ActionTypes.ROLLBACK_UPDATE:
      return {
        ...state,
        [action.payload.entity]: action.payload.originalData
      };

    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    // Jobs
    setJobs: useCallback((jobs) => {
      dispatch({ type: ActionTypes.SET_JOBS, payload: jobs });
    }, []),

    addJob: useCallback((job) => {
      dispatch({ type: ActionTypes.ADD_JOB, payload: job });
    }, []),

    updateJob: useCallback((job) => {
      dispatch({ type: ActionTypes.UPDATE_JOB, payload: job });
    }, []),

    deleteJob: useCallback((jobId) => {
      dispatch({ type: ActionTypes.DELETE_JOB, payload: jobId });
    }, []),

    archiveJob: useCallback((jobId) => {
      dispatch({ type: ActionTypes.ARCHIVE_JOB, payload: jobId });
    }, []),

    reorderJobs: useCallback((jobs) => {
      dispatch({ type: ActionTypes.REORDER_JOBS, payload: jobs });
    }, []),

    // Candidates
    setCandidates: useCallback((candidates) => {
      dispatch({ type: ActionTypes.SET_CANDIDATES, payload: candidates });
    }, []),

    updateCandidate: useCallback((candidate) => {
      dispatch({ type: ActionTypes.UPDATE_CANDIDATE, payload: candidate });
    }, []),

    updateCandidateStage: useCallback((candidateId, stage) => {
      dispatch({ 
        type: ActionTypes.UPDATE_CANDIDATE_STAGE, 
        payload: { id: candidateId, stage } 
      });
    }, []),

    addCandidateNote: useCallback((candidateId, notes) => {
      dispatch({ 
        type: ActionTypes.ADD_CANDIDATE_NOTE, 
        payload: { candidateId, notes } 
      });
    }, []),

    // Assessments
    setAssessments: useCallback((assessments) => {
      dispatch({ type: ActionTypes.SET_ASSESSMENTS, payload: assessments });
    }, []),

    addAssessment: useCallback((assessment) => {
      dispatch({ type: ActionTypes.ADD_ASSESSMENT, payload: assessment });
    }, []),

    updateAssessment: useCallback((assessment) => {
      dispatch({ type: ActionTypes.UPDATE_ASSESSMENT, payload: assessment });
    }, []),

    deleteAssessment: useCallback((assessmentId) => {
      dispatch({ type: ActionTypes.DELETE_ASSESSMENT, payload: assessmentId });
    }, []),

    // UI
    setLoading: useCallback((loading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
    }, []),

    setError: useCallback((error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    }, []),

    toggleModal: useCallback((modal, isOpen) => {
      dispatch({ type: ActionTypes.TOGGLE_MODAL, payload: { modal, isOpen } });
    }, []),

    // Filters
    updateFilters: useCallback((type, filters) => {
      dispatch({ type: ActionTypes.UPDATE_FILTERS, payload: { type, filters } });
    }, []),

    // Pagination
    updatePagination: useCallback((type, pagination) => {
      dispatch({ type: ActionTypes.UPDATE_PAGINATION, payload: { type, pagination } });
    }, []),

    // Optimistic updates
    optimisticUpdate: useCallback((entity, optimisticData, originalData) => {
      dispatch({ 
        type: ActionTypes.OPTIMISTIC_UPDATE, 
        payload: { entity, optimisticData, originalData } 
      });
    }, []),

    rollbackUpdate: useCallback((entity, originalData) => {
      dispatch({ 
        type: ActionTypes.ROLLBACK_UPDATE, 
        payload: { entity, originalData } 
      });
    }, [])
  };

  // Optimistic update helper
  const withOptimisticUpdate = useCallback(async (
    entity,
    optimisticAction,
    apiCall,
    rollbackAction
  ) => {
    const originalData = state[entity];
    
    try {
      // Apply optimistic update
      actions.optimisticUpdate(entity, optimisticAction(originalData), originalData);
      
      // Make API call
      const result = await apiCall();
      
      // If successful, the optimistic update stays
      return result;
    } catch (error) {
      // Rollback on failure
      actions.rollbackUpdate(entity, originalData);
      actions.setError(error.message);
      throw error;
    }
  }, [state, actions]);

  const value = {
    state,
    actions,
    withOptimisticUpdate
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
