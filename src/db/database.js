import Dexie from 'dexie';

// Define the database schema
export const db = new Dexie('TalentFlowDB');

db.version(1).stores({
  jobs: '++id, title, slug, status, tags, order, createdAt, updatedAt',
  candidates: '++id, name, email, phone, stage, jobId, experience, skills, notes, appliedDate, createdAt, updatedAt',
  assessments: '++id, jobId, title, questions, createdAt, updatedAt',
  candidateTimeline: '++id, candidateId, stage, date, notes, user, createdAt',
  assessmentResponses: '++id, assessmentId, candidateId, responses, submittedAt'
});

// Helper functions for database operations
export const dbHelpers = {
  // Jobs
  async getJobs(filters = {}) {
    let query = db.jobs.orderBy('order');
    
    if (filters.status && filters.status !== 'all') {
      query = query.filter(job => job.status === filters.status);
    }
    
    if (filters.search) {
      query = query.filter(job => 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query = query.filter(job => 
        filters.tags.some(tag => job.tags?.includes(tag))
      );
    }
    
    return await query.toArray();
  },

  async createJob(jobData) {
    const maxOrder = await db.jobs.orderBy('order').last();
    const newJob = {
      ...jobData,
      id: Date.now(),
      order: (maxOrder?.order || 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.jobs.add(newJob);
    return newJob;
  },

  async updateJob(id, updates) {
    const updatedJob = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await db.jobs.update(id, updatedJob);
    return await db.jobs.get(id);
  },

  async deleteJob(id) {
    await db.jobs.delete(id);
    // Also delete related candidates and assessments
    await db.candidates.where('jobId').equals(id).delete();
    await db.assessments.where('jobId').equals(id).delete();
  },

  async reorderJobs(fromOrder, toOrder) {
    const jobs = await db.jobs.orderBy('order').toArray();
    
    // Find the job being moved
    const jobToMove = jobs.find(job => job.order === fromOrder);
    if (!jobToMove) return;

    // Update orders
    if (fromOrder < toOrder) {
      // Moving down
      await db.jobs
        .where('order')
        .between(fromOrder + 1, toOrder)
        .modify(job => job.order -= 1);
    } else {
      // Moving up
      await db.jobs
        .where('order')
        .between(toOrder, fromOrder - 1)
        .modify(job => job.order += 1);
    }
    
    // Update the moved job
    await db.jobs.update(jobToMove.id, { order: toOrder });
  },

  // Candidates
  async getCandidates(filters = {}) {
    let query = db.candidates.orderBy('appliedDate');
    
    if (filters.stage && filters.stage !== 'all') {
      query = query.filter(candidate => candidate.stage === filters.stage);
    }
    
    if (filters.search) {
      query = query.filter(candidate => 
        candidate.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    return await query.toArray();
  },

  async createCandidate(candidateData) {
    const newCandidate = {
      ...candidateData,
      id: Date.now(),
      appliedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.candidates.add(newCandidate);
    return newCandidate;
  },

  async updateCandidate(id, updates) {
    const updatedCandidate = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await db.candidates.update(id, updatedCandidate);
    return await db.candidates.get(id);
  },

  async updateCandidateStage(id, stage) {
    const candidate = await db.candidates.get(id);
    if (!candidate) return null;

    // Add timeline entry
    await db.candidateTimeline.add({
      candidateId: id,
      stage,
      date: new Date().toISOString().split('T')[0],
      notes: `Moved to ${stage} stage`,
      user: 'Current User',
      createdAt: new Date().toISOString()
    });

    // Update candidate
    return await this.updateCandidate(id, { stage });
  },

  async getCandidateTimeline(candidateId) {
    return await db.candidateTimeline
      .where('candidateId')
      .equals(candidateId)
      .orderBy('createdAt')
      .reverse()
      .toArray();
  },

  // Assessments
  async getAssessments(jobId) {
    return await db.assessments.where('jobId').equals(jobId).toArray();
  },

  async createAssessment(assessmentData) {
    const newAssessment = {
      ...assessmentData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.assessments.add(newAssessment);
    return newAssessment;
  },

  async updateAssessment(id, updates) {
    const updatedAssessment = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await db.assessments.update(id, updatedAssessment);
    return await db.assessments.get(id);
  },

  async deleteAssessment(id) {
    await db.assessments.delete(id);
  },

  async submitAssessmentResponse(assessmentId, candidateId, responses) {
    const response = {
      id: Date.now(),
      assessmentId,
      candidateId,
      responses,
      submittedAt: new Date().toISOString()
    };
    
    await db.assessmentResponses.add(response);
    return response;
  }
};

// Seed data function
export const seedData = async () => {
  // Clear existing data and force fresh seed
  console.log('Clearing existing data and seeding fresh data...');
  await db.jobs.clear();
  await db.candidates.clear();
  await db.assessments.clear();
  await db.candidateTimeline.clear();
  await db.assessmentResponses.clear();

  // Seed jobs
  const jobTitles = [
    'Senior React Developer', 'Frontend Engineer', 'Full Stack Developer',
    'React Native Developer', 'JavaScript Developer', 'UI/UX Developer',
    'Software Engineer', 'Web Developer', 'Mobile Developer', 'DevOps Engineer',
    'Backend Developer', 'Node.js Developer', 'Python Developer', 'Java Developer',
    'Data Scientist', 'Machine Learning Engineer', 'Product Manager', 'Designer',
    'QA Engineer', 'Technical Lead', 'Architect', 'Scrum Master', 'Analyst',
    'Consultant', 'Freelancer'
  ];

  const companies = [
    'TechCorp', 'StartupXYZ', 'InnovateLab', 'CodeCraft', 'DevStudio',
    'WebWorks', 'AppFactory', 'DataFlow', 'CloudTech', 'AgileSoft',
    'NextGen', 'FutureCode', 'SmartDev', 'ProTech', 'EliteSoft',
    'RapidDev', 'CoreTech', 'PrimeCode', 'ApexSoft', 'VertexTech'
  ];

  const locations = [
    'Boston, MA', 'Miami, FL', 'Brooklyn, NY', 'San Francisco, CA',
    'Seattle, WA', 'Austin, TX', 'Chicago, IL', 'Denver, CO',
    'Remote', 'New York, NY', 'Los Angeles, CA', 'Portland, OR'
  ];

  const tags = [
    'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java',
    'Frontend', 'Backend', 'Full-Stack', 'Mobile', 'Remote', 'Senior',
    'Junior', 'Mid-level', 'Lead', 'Architecture', 'DevOps', 'AWS'
  ];

  // Create exactly 25 jobs with realistic data
  const jobData = [
    { title: 'Senior React Developer', company: 'TechCorp', location: 'Boston, MA', type: 'Full-Time', salary: '$90K - $120K', tags: ['React', 'JavaScript', 'Frontend', 'Senior'] },
    { title: 'Frontend Engineer', company: 'StartupXYZ', location: 'San Francisco, CA', type: 'Full-Time', salary: '$80K - $110K', tags: ['React', 'TypeScript', 'Frontend'] },
    { title: 'Full Stack Developer', company: 'InnovateLab', location: 'Remote', type: 'Full-Time', salary: '$85K - $115K', tags: ['React', 'Node.js', 'Full-Stack'] },
    { title: 'React Native Developer', company: 'MobileFirst', location: 'Austin, TX', type: 'Full-Time', salary: '$75K - $105K', tags: ['React Native', 'Mobile', 'JavaScript'] },
    { title: 'JavaScript Developer', company: 'WebWorks', location: 'Seattle, WA', type: 'Full-Time', salary: '$70K - $100K', tags: ['JavaScript', 'Frontend', 'Web'] },
    { title: 'UI/UX Developer', company: 'DesignStudio', location: 'New York, NY', type: 'Full-Time', salary: '$75K - $105K', tags: ['UI', 'UX', 'Frontend', 'Design'] },
    { title: 'Software Engineer', company: 'BigTech', location: 'Mountain View, CA', type: 'Full-Time', salary: '$100K - $140K', tags: ['Software', 'Engineering', 'Senior'] },
    { title: 'Web Developer', company: 'AgencyPro', location: 'Chicago, IL', type: 'Full-Time', salary: '$65K - $95K', tags: ['Web', 'Frontend', 'HTML', 'CSS'] },
    { title: 'Mobile Developer', company: 'AppFactory', location: 'Denver, CO', type: 'Full-Time', salary: '$80K - $110K', tags: ['Mobile', 'iOS', 'Android'] },
    { title: 'DevOps Engineer', company: 'CloudTech', location: 'Remote', type: 'Full-Time', salary: '$90K - $130K', tags: ['DevOps', 'AWS', 'Docker', 'Kubernetes'] },
    { title: 'Backend Developer', company: 'DataFlow', location: 'Portland, OR', type: 'Full-Time', salary: '$85K - $115K', tags: ['Backend', 'Node.js', 'Python', 'API'] },
    { title: 'Node.js Developer', company: 'ServerSoft', location: 'Miami, FL', type: 'Full-Time', salary: '$75K - $105K', tags: ['Node.js', 'JavaScript', 'Backend'] },
    { title: 'Python Developer', company: 'DataScience Inc', location: 'Remote', type: 'Full-Time', salary: '$80K - $120K', tags: ['Python', 'Data Science', 'Backend'] },
    { title: 'Java Developer', company: 'EnterpriseCorp', location: 'Washington, DC', type: 'Full-Time', salary: '$85K - $125K', tags: ['Java', 'Spring', 'Backend', 'Enterprise'] },
    { title: 'Data Scientist', company: 'AnalyticsPro', location: 'Remote', type: 'Full-Time', salary: '$95K - $135K', tags: ['Data Science', 'Python', 'Machine Learning'] },
    { title: 'Machine Learning Engineer', company: 'AI Solutions', location: 'San Francisco, CA', type: 'Full-Time', salary: '$110K - $150K', tags: ['Machine Learning', 'Python', 'AI', 'TensorFlow'] },
    { title: 'Product Manager', company: 'ProductCo', location: 'New York, NY', type: 'Full-Time', salary: '$100K - $140K', tags: ['Product', 'Management', 'Strategy'] },
    { title: 'UX Designer', company: 'DesignLab', location: 'Los Angeles, CA', type: 'Full-Time', salary: '$70K - $100K', tags: ['UX', 'Design', 'Research', 'Prototyping'] },
    { title: 'QA Engineer', company: 'QualityAssured', location: 'Remote', type: 'Full-Time', salary: '$65K - $95K', tags: ['QA', 'Testing', 'Automation', 'Selenium'] },
    { title: 'Technical Lead', company: 'LeadTech', location: 'Boston, MA', type: 'Full-Time', salary: '$120K - $160K', tags: ['Leadership', 'Technical', 'Architecture', 'Senior'] },
    { title: 'Software Architect', company: 'ArchitectureCorp', location: 'Remote', type: 'Full-Time', salary: '$130K - $170K', tags: ['Architecture', 'Design', 'Senior', 'Technical'] },
    { title: 'Scrum Master', company: 'AgileSoft', location: 'Austin, TX', type: 'Full-Time', salary: '$80K - $110K', tags: ['Scrum', 'Agile', 'Management', 'Process'] },
    { title: 'Business Analyst', company: 'AnalysisInc', location: 'Chicago, IL', type: 'Full-Time', salary: '$70K - $100K', tags: ['Analysis', 'Business', 'Requirements', 'Documentation'] },
    { title: 'Technical Consultant', company: 'ConsultingPro', location: 'Remote', type: 'Contract', salary: '$100K - $150K', tags: ['Consulting', 'Technical', 'Contract', 'Senior'] },
    { title: 'Freelance Developer', company: 'FreelanceHub', location: 'Remote', type: 'Contract', salary: '$60K - $120K', tags: ['Freelance', 'Contract', 'Remote', 'Flexible'] }
  ];

  for (let i = 0; i < 25; i++) {
    const job = {
      ...jobData[i],
      status: Math.random() > 0.2 ? 'active' : 'archived', // 80% active, 20% archived
      description: `We are seeking a talented ${jobData[i].title.toLowerCase()} to join our team at ${jobData[i].company}. This role offers great opportunities for growth, learning, and making an impact in a fast-paced environment. You'll work with cutting-edge technologies and collaborate with a team of passionate professionals.`,
      order: i + 1,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Last 90 days
      updatedAt: new Date().toISOString()
    };
    
    await db.jobs.add(job);
  }

  // Seed exactly 1000 candidates with realistic data
  const firstNames = [
    'John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Amy', 'Tom', 'Emma',
    'Alex', 'Maria', 'James', 'Jennifer', 'Robert', 'Linda', 'Michael', 'Patricia', 'William', 'Elizabeth',
    'Richard', 'Jennifer', 'Charles', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen',
    'Daniel', 'Nancy', 'Paul', 'Lisa', 'Mark', 'Betty', 'Donald', 'Helen', 'George', 'Sandra',
    'Kenneth', 'Donna', 'Steven', 'Carol', 'Edward', 'Ruth', 'Brian', 'Sharon', 'Ronald', 'Michelle'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
  ];
  
  const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
  const stageWeights = [0.4, 0.2, 0.15, 0.1, 0.1, 0.05]; // More realistic distribution
  
  const skills = [
    'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'Vue.js', 'Angular', 'MongoDB', 'PostgreSQL',
    'HTML', 'CSS', 'SASS', 'Webpack', 'Docker', 'AWS', 'Git', 'REST API', 'GraphQL', 'Redux',
    'Express', 'Django', 'Spring', 'MySQL', 'Redis', 'Elasticsearch', 'Kubernetes', 'Jenkins', 'Terraform', 'Linux'
  ];

  // Generate weighted random stage
  const getRandomStage = () => {
    const random = Math.random();
    let cumulative = 0;
    for (let i = 0; i < stages.length; i++) {
      cumulative += stageWeights[i];
      if (random <= cumulative) return stages[i];
    }
    return stages[0];
  };

  for (let i = 0; i < 1000; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const stage = getRandomStage();
    
    const candidate = {
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@email.com`,
      phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      stage,
      jobId: Math.floor(Math.random() * 25) + 1,
      experience: Math.floor(Math.random() * 12) + 1, // 1-12 years
      skills: skills.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 2), // 2-6 skills
      notes: `Candidate ${firstName} ${lastName} applied for the position. ${stage === 'hired' ? 'Successfully hired!' : stage === 'rejected' ? 'Not a good fit.' : 'Currently in ' + stage + ' stage.'}`,
      appliedDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 90 days
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.candidates.add(candidate);
  }

  // Seed assessments - Create 5+ assessments for different jobs
  const questionTypes = ['single-choice', 'multi-choice', 'short-text', 'long-text', 'numeric'];
  const assessmentTemplates = [
    {
      title: 'React Developer Assessment',
      questions: [
        'What is the primary purpose of React hooks?',
        'Which of the following are React lifecycle methods?',
        'What is JSX?',
        'Explain the difference between controlled and uncontrolled components.',
        'How many years of React experience do you have?',
        'What is the virtual DOM?',
        'Which hook is used for side effects?',
        'What is the purpose of useCallback?',
        'How do you handle forms in React?',
        'What is Redux used for?'
      ]
    },
    {
      title: 'JavaScript Fundamentals Assessment',
      questions: [
        'What is the difference between let and var?',
        'What is closure in JavaScript?',
        'Explain the concept of prototypal inheritance.',
        'What is the difference between == and ===?',
        'How do you handle asynchronous operations?',
        'What is hoisting?',
        'Explain the event loop.',
        'What are arrow functions?',
        'How do you prevent memory leaks?',
        'What is the difference between null and undefined?'
      ]
    },
    {
      title: 'Full Stack Developer Assessment',
      questions: [
        'What is REST API?',
        'Explain the difference between SQL and NoSQL databases.',
        'How do you handle authentication?',
        'What is CORS?',
        'Explain microservices architecture.',
        'How do you optimize database queries?',
        'What is Docker used for?',
        'How do you handle errors in Node.js?',
        'What is the difference between GET and POST?',
        'How do you implement caching?'
      ]
    },
    {
      title: 'Frontend Engineer Assessment',
      questions: [
        'What is CSS Grid?',
        'Explain the box model.',
        'How do you make a website responsive?',
        'What is the difference between CSS and SCSS?',
        'How do you optimize website performance?',
        'What is Webpack used for?',
        'Explain the difference between CSS and JavaScript animations.',
        'How do you handle cross-browser compatibility?',
        'What is the purpose of CSS preprocessors?',
        'How do you implement accessibility?'
      ]
    },
    {
      title: 'Backend Developer Assessment',
      questions: [
        'What is the difference between SQL and NoSQL?',
        'How do you handle database transactions?',
        'Explain the concept of database indexing.',
        'What is the difference between authentication and authorization?',
        'How do you implement rate limiting?',
        'What is the purpose of API versioning?',
        'How do you handle file uploads?',
        'What is the difference between synchronous and asynchronous processing?',
        'How do you implement logging?',
        'What is the purpose of database migrations?'
      ]
    }
  ];

  // Create assessments for different jobs
  const assessmentJobIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // 10 different jobs get assessments
  
  for (let i = 0; i < assessmentJobIds.length; i++) {
    const jobId = assessmentJobIds[i];
    const template = assessmentTemplates[i % assessmentTemplates.length];
    const questions = [];
    
    for (let q = 0; q < template.questions.length; q++) {
      const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      const question = {
        id: q + 1,
        type,
        question: template.questions[q],
        required: Math.random() > 0.3,
        options: type.includes('choice') ? [
          'Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'
        ] : undefined,
        correctAnswer: type === 'single-choice' ? Math.floor(Math.random() * 5) : undefined,
        correctAnswers: type === 'multi-choice' ? [0, 2] : undefined,
        min: type === 'numeric' ? 0 : undefined,
        max: type === 'numeric' ? 10 : undefined,
        maxLength: type.includes('text') ? 500 : undefined,
        conditionalLogic: {
          enabled: Math.random() > 0.8, // 20% chance of conditional logic
          dependsOn: null,
          condition: 'equals',
          value: ''
        }
      };
      questions.push(question);
    }

    const assessment = {
      jobId,
      title: template.title,
      questions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.assessments.add(assessment);
  }

  console.log('✅ Data seeding completed:');
  console.log(`   - ${await db.jobs.count()} jobs created`);
  console.log(`   - ${await db.candidates.count()} candidates created`);
  console.log(`   - ${await db.assessments.count()} assessments created`);
};
