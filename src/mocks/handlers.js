import { http, HttpResponse } from 'msw';
import { dbHelpers } from '../db/database.js';

// Helper function to simulate network delay and errors
const simulateNetwork = async (data, shouldError = false) => {
  // Random delay between 200-1200ms
  const delay = Math.random() * 1000 + 200;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // 5-10% error rate on write endpoints
  if (shouldError && Math.random() < 0.08) {
    throw new Error('Network error: Please try again');
  }
  
  return data;
};

// Helper function to get query parameters
const getQueryParams = (url) => {
  const searchParams = new URL(url).searchParams;
  return {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    stage: searchParams.get('stage') || 'all',
    page: parseInt(searchParams.get('page')) || 1,
    pageSize: parseInt(searchParams.get('pageSize')) || 10,
    sort: searchParams.get('sort') || 'order'
  };
};

export const handlers = [
  // Jobs API
  http.get('/api/jobs', async ({ request }) => {
    try {
      const params = getQueryParams(request.url);
      const jobs = await dbHelpers.getJobs(params);
      
      // Apply pagination
      const startIndex = (params.page - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedJobs = jobs.slice(startIndex, endIndex);
      
      const result = await simulateNetwork({
        data: paginatedJobs,
        pagination: {
          page: params.page,
          pageSize: params.pageSize,
          total: jobs.length,
          totalPages: Math.ceil(jobs.length / params.pageSize)
        }
      });
      
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.post('/api/jobs', async ({ request }) => {
    try {
      const jobData = await request.json();
      const job = await dbHelpers.createJob(jobData);
      const result = await simulateNetwork(job, true);
      return HttpResponse.json(result, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.patch('/api/jobs/:id', async ({ request, params }) => {
    try {
      const updates = await request.json();
      const job = await dbHelpers.updateJob(parseInt(params.id), updates);
      const result = await simulateNetwork(job, true);
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.patch('/api/jobs/:id/reorder', async ({ request, params }) => {
    try {
      const { fromOrder, toOrder } = await request.json();
      await dbHelpers.reorderJobs(fromOrder, toOrder);
      const result = await simulateNetwork({ success: true }, true);
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.delete('/api/jobs/:id', async ({ request, params }) => {
    try {
      await dbHelpers.deleteJob(parseInt(params.id));
      const result = await simulateNetwork({ success: true }, true);
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  // Candidates API
  http.get('/api/candidates', async ({ request }) => {
    try {
      const params = getQueryParams(request.url);
      const candidates = await dbHelpers.getCandidates(params);
      
      // Apply pagination
      const startIndex = (params.page - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedCandidates = candidates.slice(startIndex, endIndex);
      
      const result = await simulateNetwork({
        data: paginatedCandidates,
        pagination: {
          page: params.page,
          pageSize: params.pageSize,
          total: candidates.length,
          totalPages: Math.ceil(candidates.length / params.pageSize)
        }
      });
      
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.post('/api/candidates', async ({ request }) => {
    try {
      const candidateData = await request.json();
      const candidate = await dbHelpers.createCandidate(candidateData);
      const result = await simulateNetwork(candidate, true);
      return HttpResponse.json(result, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.patch('/api/candidates/:id', async ({ request, params }) => {
    try {
      const updates = await request.json();
      const candidate = await dbHelpers.updateCandidate(parseInt(params.id), updates);
      const result = await simulateNetwork(candidate, true);
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.patch('/api/candidates/:id/stage', async ({ request, params }) => {
    try {
      const { stage } = await request.json();
      const candidate = await dbHelpers.updateCandidateStage(parseInt(params.id), stage);
      const result = await simulateNetwork(candidate, true);
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.get('/api/candidates/:id/timeline', async ({ request, params }) => {
    try {
      const timeline = await dbHelpers.getCandidateTimeline(parseInt(params.id));
      const result = await simulateNetwork(timeline);
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  // Assessments API
  http.get('/api/assessments/:jobId', async ({ request, params }) => {
    try {
      const assessments = await dbHelpers.getAssessments(parseInt(params.jobId));
      const result = await simulateNetwork(assessments);
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.put('/api/assessments/:jobId', async ({ request, params }) => {
    try {
      const assessmentData = await request.json();
      const assessment = await dbHelpers.createAssessment({
        ...assessmentData,
        jobId: parseInt(params.jobId)
      });
      const result = await simulateNetwork(assessment, true);
      return HttpResponse.json(result, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.patch('/api/assessments/:id', async ({ request, params }) => {
    try {
      const updates = await request.json();
      const assessment = await dbHelpers.updateAssessment(parseInt(params.id), updates);
      const result = await simulateNetwork(assessment, true);
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.delete('/api/assessments/:id', async ({ request, params }) => {
    try {
      await dbHelpers.deleteAssessment(parseInt(params.id));
      const result = await simulateNetwork({ success: true }, true);
      return HttpResponse.json(result);
    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  }),

  http.post('/api/assessments/:id/submit', async ({ request, params }) => {
    try {
      const { candidateId, responses } = await request.json();
      const response = await dbHelpers.submitAssessmentResponse(
        parseInt(params.id),
        candidateId,
        responses
      );
      const result = await simulateNetwork(response, true);
      return HttpResponse.json(result, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ error: error.message }, { status: 500 });
    }
  })
];
