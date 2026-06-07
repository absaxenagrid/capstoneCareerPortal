import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,   // 2 min — covers file upload + parse
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  res => res,
  err => {
    const status  = err.response?.status
    const method  = err.config?.method?.toUpperCase()
    const url     = err.config?.url || ''

    // Let mutation onError handlers deal with these — don't double-toast
    if (status === 409 || status === 404) return Promise.reject(err)

    // 503 from gateway means the downstream service is still starting up
    // Show a friendlier message and let the caller retry
    if (status === 503) {
      // Only show on non-retry attempts to avoid spam
      if (!err.config?._retried) {
        toast.error('Service is starting up — retrying…', { id: 'svc-starting', duration: 3000 })
      }
      return Promise.reject(err)
    }

    // For mutations (POST/PUT/PATCH) let the onError handler show the toast
    // so we don't double-toast
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return Promise.reject(err)
    }

    // For GET requests show a generic error
    if (status >= 500) {
      toast.error('Server error — please try again.', { id: 'server-err' })
    }

    return Promise.reject(err)
  }
)

// ── Retry helper: auto-retry once on 503 after 2s ────────────────────────────
api.interceptors.response.use(null, async err => {
  const status = err.response?.status
  if (status === 503 && !err.config?._retried) {
    err.config._retried = true
    await new Promise(r => setTimeout(r, 2000))
    return api(err.config)
  }
  return Promise.reject(err)
})

// ── Candidate APIs ────────────────────────────────────────────────────────────
export const candidateApi = {
  create:  (data)     => api.post('/candidates', data),
  getById: (id)       => api.get(`/candidates/${id}`),
  update:  (id, data) => api.put(`/candidates/${id}`, data),

  addEducation:  (id, data) => api.post(`/candidates/${id}/education`, data),
  getEducation:  (id)       => api.get(`/candidates/${id}/education`),

  addExperience:  (id, data) => api.post(`/candidates/${id}/experience`, data),
  getExperience:  (id)       => api.get(`/candidates/${id}/experience`),

  addSkill:  (id, skillName) => api.post(`/candidates/${id}/skills`, { skillName }),
  getSkills: (id)            => api.get(`/candidates/${id}/skills`),

  savePreferences: (id, data) => api.post(`/candidates/${id}/preferences`, data),
  getPreferences:  (id)       => api.get(`/candidates/${id}/preferences`),

  registerResume:  (id, objectKey, originalFilename) =>
    api.post(`/resumes/register/${id}`, { objectKey, originalFilename }),
  getActiveResume: (id) => api.get(`/resumes/${id}/active`),
}

// ── Application APIs ──────────────────────────────────────────────────────────
export const applicationApi = {
  apply: (data) => api.post('/applications/apply', data),
  getCandidateApplications: (candidateEmail, page = 0) =>
    api.get(`/applications/candidate?email=${encodeURIComponent(candidateEmail)}&page=${page}&size=10`),
  getById:  (id) => api.get(`/applications/${id}`),
  withdraw: (id) => api.patch(`/applications/${id}/withdraw`),
}

// ── File (MinIO) APIs ─────────────────────────────────────────────────────────
export const fileApi = {
  uploadResume: (identifier, file) => {
    const formData = new FormData()
    formData.append('file', file)
    const safeId = encodeURIComponent(String(identifier))
    return api.post(`/files/resume/upload/${safeId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    })
  },
  getPresignedUrl: (objectKey) =>
    api.get(`/files/resume/presigned-url?objectKey=${encodeURIComponent(objectKey)}`),
  deleteFile: (objectKey) =>
    api.delete(`/files/resume?objectKey=${encodeURIComponent(objectKey)}`),
}

// ── Notification APIs ─────────────────────────────────────────────────────────
export const notificationApi = {
  getAll:     (email) => api.get(`/notifications?email=${encodeURIComponent(email)}`),
  markRead:   (id)    => api.patch(`/notifications/${id}/read`),
  markAllRead:(email) => api.patch(`/notifications/read-all?email=${encodeURIComponent(email)}`),
}

// ── Job API (external mock) ───────────────────────────────────────────────────
const normaliseList = p => Array.isArray(p) ? p : (p?.data && Array.isArray(p.data) ? p.data : [])
const normaliseItem = p => (p?.data && typeof p.data === 'object' && !Array.isArray(p.data)) ? p.data : p

export const jobApi = {
  getAll:  () =>
    axios.get('https://mock-api-pido.onrender.com/api/jobs')
      .then(res => ({ ...res, data: normaliseList(res.data) })),
  getById: (id) =>
    axios.get(`https://mock-api-pido.onrender.com/api/jobs/${id}`)
      .then(res => ({ ...res, data: normaliseItem(res.data) })),
}

export default api
