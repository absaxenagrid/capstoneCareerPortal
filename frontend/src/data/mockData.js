// ─── Mock Profile (used when backend is unavailable) ───────────────────────
export const MOCK_PROFILE = {
  candidateId: 1,
  firstName: 'Alex',
  lastName: 'Sterling',
  email: 'alex.sterling@forge.dev',
  phoneNumber: '+1 (555) 892-0441',
  dateOfBirth: '1995-04-12',
  gender: 'Male',
  address: '123 Tech Street, San Francisco, CA 94105',
  profileTitle: 'Senior Software Engineer',
  profileBio: 'Full-stack engineer with 6+ years building distributed systems and AI-powered products.',
  profileComplete: true,
  activeResume: {
    resumeId: 1,
    originalFilename: 'Alex_Sterling_Resume_2024.pdf',
    objectKey: 'candidate-resumes/1/mock-resume.pdf',
    version: 2,
    uploadedAt: '2024-10-12T10:00:00',
  },
}

export const MOCK_EDUCATION = [
  { educationId: 1, degree: 'B.Tech', specialization: 'Computer Science', institutionName: 'MIT', startYear: 2013, endYear: 2017, percentage: 91.5 },
  { educationId: 2, degree: 'M.S.', specialization: 'Machine Learning', institutionName: 'Stanford University', startYear: 2017, endYear: 2019, percentage: 89.0 },
]

export const MOCK_EXPERIENCE = [
  { experienceId: 1, companyName: 'Anthropic', designation: 'Senior AI Engineer', employmentType: 'Full-time', startDate: '2022-01-01', endDate: null, currentlyWorking: true, responsibilities: 'Building RLHF pipelines and fine-tuning large language models.' },
  { experienceId: 2, companyName: 'Stripe', designation: 'Software Engineer II', employmentType: 'Full-time', startDate: '2019-06-01', endDate: '2021-12-31', currentlyWorking: false, responsibilities: 'Payment infrastructure, fraud detection systems, and API design.' },
]

export const MOCK_SKILLS = [
  { skillId: 1, skillName: 'Python' },
  { skillId: 2, skillName: 'Java Spring Boot' },
  { skillId: 3, skillName: 'React' },
  { skillId: 4, skillName: 'Kubernetes' },
  { skillId: 5, skillName: 'PostgreSQL' },
  { skillId: 6, skillName: 'AWS' },
  { skillId: 7, skillName: 'TensorFlow' },
  { skillId: 8, skillName: 'Docker' },
]

export const MOCK_PREFERENCES = {
  workMode: 'Remote',
  preferredLocations: ['San Francisco, CA', 'New York, NY (Remote)', 'Austin, TX'],
  desiredSalaryMin: 160000,
  desiredSalaryMax: 220000,
  noticePeriodDays: 30,
  willingToRelocate: true,
}

// ─── Mock Chat Messages ─────────────────────────────────────────────────────
export const MOCK_CHAT_HISTORY = [
  {
    id: 1,
    sender: 'recruiter',
    senderName: 'Sarah Chen',
    senderRole: 'Talent Acquisition · Forge AI',
    avatar: 'SC',
    message: 'Hi Alex! I came across your profile and I\'m really impressed by your work at Anthropic. We have an exciting Senior AI Engineer role that I think you\'d be a great fit for.',
    timestamp: '2024-10-15T09:00:00',
    read: true,
  },
  {
    id: 2,
    sender: 'me',
    message: 'Hi Sarah! Thanks for reaching out. I\'d love to learn more about the role.',
    timestamp: '2024-10-15T09:30:00',
    read: true,
  },
  {
    id: 3,
    sender: 'recruiter',
    senderName: 'Sarah Chen',
    senderRole: 'Talent Acquisition · Forge AI',
    avatar: 'SC',
    message: 'Great! The role involves building our core AI orchestration engine. The team is small but very senior. Would you be available for a 30-min call this week?',
    timestamp: '2024-10-15T10:00:00',
    read: true,
  },
  {
    id: 4,
    sender: 'recruiter',
    senderName: 'Marcus Rivera',
    senderRole: 'Engineering Manager · Forge AI',
    avatar: 'MR',
    message: 'Hey Alex — Sarah passed along your profile. Your RLHF work at Anthropic is exactly what we\'re looking for. I\'d love to set up a technical chat.',
    timestamp: '2024-10-16T14:00:00',
    read: false,
  },
]

export const MOCK_CONVERSATIONS = [
  {
    id: 1,
    with: 'Sarah Chen',
    role: 'Talent Acquisition · Forge AI',
    avatar: 'SC',
    lastMessage: 'Would you be available for a 30-min call this week?',
    timestamp: '2024-10-15T10:00:00',
    unread: 0,
    jobTitle: 'Senior AI Engineer',
    messages: MOCK_CHAT_HISTORY.filter(m => [1,2,3].includes(m.id)),
  },
  {
    id: 2,
    with: 'Marcus Rivera',
    role: 'Engineering Manager · Forge AI',
    avatar: 'MR',
    lastMessage: "I'd love to set up a technical chat.",
    timestamp: '2024-10-16T14:00:00',
    unread: 1,
    jobTitle: 'Principal ML Engineer',
    messages: MOCK_CHAT_HISTORY.filter(m => m.id === 4),
  },
]

// ─── EEO Options ────────────────────────────────────────────────────────────
export const EEO_GENDER = ['Prefer not to say', 'Male', 'Female', 'Non-binary', 'Other']
export const EEO_ETHNICITY = ['Prefer not to say', 'White', 'Black or African American', 'Hispanic or Latino', 'Asian', 'Native American', 'Pacific Islander', 'Two or more races']
export const EEO_VETERAN = ['Prefer not to say', 'Not a veteran', 'Veteran']
export const EEO_DISABILITY = ['Prefer not to say', 'No disability', 'Yes, I have a disability']
