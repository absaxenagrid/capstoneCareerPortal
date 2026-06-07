import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { applicationApi, fileApi, jobApi } from '../services/api'
import { useStore } from '../store'
import toast from 'react-hot-toast'
import {
  Check, Upload, User, BookOpen, Briefcase, FileText,
  Link as LinkIcon, HelpCircle, ChevronRight, ChevronLeft,
  Plus, Trash2, AlertCircle, Loader2, Sparkles
} from 'lucide-react'

const STEPS = [
  { id: 'resume',    label: 'Resume',       icon: FileText },
  { id: 'personal',  label: 'Personal',     icon: User },
  { id: 'education', label: 'Education',    icon: BookOpen },
  { id: 'experience',label: 'Experience',   icon: Briefcase },
  { id: 'links',     label: 'Links',        icon: LinkIcon },
  { id: 'questions', label: 'Questions',    icon: HelpCircle },
  { id: 'review',    label: 'Review',       icon: Check },
]

const L = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide'
const I = 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-forge-blue text-gray-900 dark:text-gray-100 placeholder-gray-400'
const G = 'grid grid-cols-1 sm:grid-cols-2 gap-3'

// ── Parse resume text with Claude API ────────────────────────────────────────
async function parseResumeWithAI(file) {
  // Read file as base64
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const isPdf  = file.name.toLowerCase().endsWith('.pdf')
  const isDocx = file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')

  let messageContent

  if (isPdf) {
    messageContent = [
      {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: base64 }
      },
      {
        type: 'text',
        text: `Extract the following from this resume and return ONLY a valid JSON object with no markdown, no explanation, no code fences:
{
  "fullName": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "linkedin": "string or null",
  "github": "string or null",
  "portfolio": "string or null",
  "totalExperienceYears": number or null,
  "education": [{"degree":"","university":"","graduationYear":null}],
  "experience": [{"company":"","title":"","startDate":"","endDate":"","current":false,"description":""}]
}`
      }
    ]
  } else {
    // For DOCX we can't send binary directly — ask user to use PDF, but still try text extraction
    throw new Error('DOCX_USE_BACKEND')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: messageContent }]
    })
  })

  if (!response.ok) throw new Error(`Claude API error ${response.status}`)
  const data = await response.json()
  const text = data?.content?.[0]?.text || ''

  // Strip any accidental markdown fences
  const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  return JSON.parse(clean)
}

// ── Parse resume via backend (Tika) — fallback for DOCX ─────────────────────
async function parseResumeViaBackend(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/resumes/parse', {
    method: 'POST',
    body: formData
  })
  if (!res.ok) throw new Error(`Backend parse error ${res.status}`)
  return res.json()
}

export default function ApplicationFormPage() {
  const params = useParams()
  const rawParam = params.slug ?? params.jobId ?? ''
  const jobId = rawParam.includes('-') ? rawParam.split('-').pop() : rawParam
  const navigate        = useNavigate()
  const candidateEmail  = useStore(s => s.candidateEmail)
  const addNotification        = useStore(s => s.addNotification)
  const incrementReferralClick = useStore(s => s.incrementReferralClick)

  // REQ-JP-11: detect referral token from URL (?ref=TOKEN)
  const [searchParams] = useSearchParams()
  const referralToken  = searchParams.get('ref')

  // Track click when page loads with a referral token
  const [clickTracked, setClickTracked] = useState(false)
  if (referralToken && !clickTracked) {
    incrementReferralClick(referralToken)
    setClickTracked(true)
  }

  const [step,           setStep]           = useState(0)
  const [submitted,      setSubmitted]      = useState(false)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [parsing,        setParsing]        = useState(false)
  const [prefilled,      setPrefilled]      = useState(false)
  const fileRef = useRef(null)

  // ── Form state ───────────────────────────────────────────────
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeName, setResumeName] = useState('')
  const [resumeKey,  setResumeKey]  = useState('')

  const [personal, setPersonal] = useState({
    fullName: '', email: candidateEmail !== 'candidate@example.com' ? candidateEmail : '',
    phone: '', location: '',
  })
  const [education,  setEducation]  = useState([{ degree: '', university: '', graduationYear: '' }])
  const [experience, setExperience] = useState([{ company: '', title: '', startDate: '', endDate: '', current: false, description: '' }])
  const [totalExp,   setTotalExp]   = useState('')
  const [links,      setLinks]      = useState({ linkedin: '', github: '', portfolio: '', other: '' })
  const [gridQ,      setGridQ]      = useState({
    legallyAuthorized: '', currentCtc: '', expectedCtc: '',
    noticePeriod: '30', currentLocation: '', preferredLocation: '',
    willingToRelocate: '', additionalComments: '',
  })
  const [declarationAccepted, setDeclarationAccepted] = useState(false)

  // ── Job data ─────────────────────────────────────────────────
  const { data: job } = useQuery({
    queryKey: ['job', jobId],
    queryFn:  () => jobApi.getById(jobId).then(r => r.data),
    enabled:  !!jobId,
  })

  // ── Apply parsed data to form fields ─────────────────────────
  const applyParsed = (d) => {
    if (!d) return
    if (d.fullName)  setPersonal(p => ({ ...p, fullName:  d.fullName }))
    if (d.email)     setPersonal(p => ({ ...p, email:     d.email }))
    if (d.phone)     setPersonal(p => ({ ...p, phone:     d.phone }))
    if (d.location)  setPersonal(p => ({ ...p, location:  d.location }))
    if (d.linkedin)  setLinks(l => ({ ...l, linkedin:  d.linkedin }))
    if (d.github)    setLinks(l => ({ ...l, github:    d.github }))
    if (d.portfolio) setLinks(l => ({ ...l, portfolio: d.portfolio }))

    if (Array.isArray(d.education) && d.education.length > 0) {
      const edu = d.education.map(e => ({
        degree:         String(e.degree  || ''),
        university:     String(e.university || e.institution || ''),
        graduationYear: e.graduationYear ? String(e.graduationYear) : '',
      }))
      setEducation(edu)
    }

    if (Array.isArray(d.experience) && d.experience.length > 0) {
      const exp = d.experience.map(e => ({
        company:     String(e.company     || e.companyName  || ''),
        title:       String(e.title       || e.designation  || ''),
        startDate:   String(e.startDate   || ''),
        endDate:     String(e.endDate     || ''),
        current:     Boolean(e.current    || e.currentlyWorking || false),
        description: String(e.description || e.responsibilities || ''),
      }))
      setExperience(exp)
    }

    const years = d.totalExperienceYears ?? d.totalExperience
    if (years != null) setTotalExp(String(years))

    setPrefilled(true)
    toast.success('✓ Resume parsed — fields pre-filled! Review and edit below.')
  }

  // ── Upload + parse mutation ───────────────────────────────────
  const uploadMut = useMutation({
    mutationFn: async (file) => {
      // Step 1: Upload file to MinIO via file-service
      const identifier = personal.email || candidateEmail || 'guest'
      const up = await fileApi.uploadResume(identifier, file)
      const key = up.data?.objectKey || up.data?.key || `resumes/${Date.now()}_${file.name}`
      setResumeKey(key)
      setResumeName(file.name)
      setResumeFile(file)

      // Step 2: Parse resume for pre-fill
      setParsing(true)
      try {
        let parsed
        if (file.name.toLowerCase().endsWith('.pdf')) {
          // Try AI parsing first (uses Claude directly in-browser for PDF)
          try {
            parsed = await parseResumeWithAI(file)
          } catch (aiErr) {
            // Fallback to backend Tika parsing
            parsed = await parseResumeViaBackend(file)
          }
        } else {
          // DOCX — use backend Tika parser
          parsed = await parseResumeViaBackend(file)
        }
        applyParsed(parsed)
      } catch (parseErr) {
        console.warn('Resume parsing failed:', parseErr)
        toast('Resume uploaded. Fill in your details below.', { icon: 'ℹ️' })
      } finally {
        setParsing(false)
      }

      return key
    },
    onError: (err) => {
      setParsing(false)
      toast.error('Upload failed: ' + (err?.message || 'Please try again.'))
    },
  })

  // ── Submit application ────────────────────────────────────────
  const applyMut = useMutation({
    mutationFn: () => {
      const toNum = v => { const n = parseFloat(v); return isNaN(n) ? null : n }
      const toInt = v => { const n = parseInt(v);   return isNaN(n) ? null : n }
      const email = (personal.email || candidateEmail || '').trim()
      if (!email) throw new Error('Email is required. Please fill in your email on the Personal Info step.')

      return applicationApi.apply({
        candidateEmail:          email,
        jobId:                   Number(jobId),
        jobTitle:                job?.title  || null,
        resumeFilePath:          resumeKey   || null,
        resumeOriginalFilename:  resumeName  || null,
        source:                  referralToken ? 'REFERRAL' : 'CAREERS_PORTAL',
        snapshot: {
          candidateName:       personal.fullName  || null,
          email:               email,
          phoneNumber:         personal.phone     || null,
          location:            personal.location  || null,
          totalExperienceYears: toNum(totalExp),
          currentCtc:          toInt(gridQ.currentCtc),
          expectedCtc:         toInt(gridQ.expectedCtc),
          noticePeriodDays:    toInt(gridQ.noticePeriod) ?? 30,
          legallyAuthorized:   gridQ.legallyAuthorized === 'yes',
          willingToRelocate:   gridQ.willingToRelocate  === 'yes',
          additionalComments:  gridQ.additionalComments || null,
          educationJson:       education,
          experienceJson:      experience,
          socialLinksJson:     links,
          skillsJson:          null,
        }
      })
    },
    onSuccess: (res) => {
      addNotification({
        message: `Your application for ${job?.title || 'the job'} has been successfully submitted and a confirmation email has been sent.`,
        type: 'APPLICATION',
        reference_id: String(res?.data?.applicationId || ''),
      })
      setSubmitted(true)
    },
    onError: (err) => {
      // Client-side validation error (thrown directly)
      if (err.message && !err.response) { toast.error(err.message); return }
      // Duplicate application
      if (err.response?.status === 409) { setAlreadyApplied(true); return }
      // Service unavailable — show retry guidance
      if (err.response?.status === 503) {
        toast.error('Service is temporarily unavailable. Please wait a moment and try again.', { duration: 5000 })
        return
      }
      // Show real backend error message
      const msg = err.response?.data?.message
                || err.response?.data?.error
                || `Submission failed (${err.response?.status || 'network error'}). Please try again.`
      toast.error(msg, { duration: 6000 })
    },
  })

  // ── List helpers ─────────────────────────────────────────────
  const addEdu    = () => setEducation(e => [...e, { degree: '', university: '', graduationYear: '' }])
  const removeEdu = i  => setEducation(e => e.filter((_, idx) => idx !== i))
  const updateEdu = (i, k, v) => setEducation(e => e.map((item, idx) => idx === i ? { ...item, [k]: v } : item))

  const addExp    = () => setExperience(e => [...e, { company: '', title: '', startDate: '', endDate: '', current: false, description: '' }])
  const removeExp = i  => setExperience(e => e.filter((_, idx) => idx !== i))
  const updateExp = (i, k, v) => setExperience(e => e.map((item, idx) => idx === i ? { ...item, [k]: v } : item))

  const goNext = () => { if (step < STEPS.length - 1) { setStep(s => s + 1); window.scrollTo(0, 0) } }
  const goPrev = () => { if (step > 0)               { setStep(s => s - 1); window.scrollTo(0, 0) } }

  const handleFile = (file) => {
    if (!file) return
    if (file.size > 20 * 1024 * 1024) { toast.error('File too large (max 20 MB)'); return }
    uploadMut.mutate(file)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const busy = uploadMut.isPending || parsing

  // ── Already applied modal ─────────────────────────────────────
  if (alreadyApplied) return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-orange-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Already Applied</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          You have already applied for <strong>{job?.title}</strong>. Duplicate applications are not allowed.
        </p>
        <button onClick={() => navigate('/past-applications')} className="btn-primary w-full mb-3">View My Applications</button>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700">Go Back</button>
      </div>
    </div>
  )

  // ── Success modal ─────────────────────────────────────────────
  if (submitted) return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full border-2 border-forge-blue flex items-center justify-center mx-auto mb-2">
          <Check size={28} className="text-forge-blue" />
        </div>
        <div className="w-full h-1 bg-forge-blue rounded mb-5" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Application Submitted!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          Your application for <strong>{job?.title}</strong> has been received.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Confirmation sent to <strong>{personal.email || candidateEmail}</strong>
        </p>
        <button onClick={() => navigate('/past-applications')} className="btn-primary w-full mb-3">View My Applications →</button>
        <button onClick={() => navigate('/career-portal')} className="text-sm text-gray-500 hover:text-gray-700">Return to Portal</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="mb-5">
          <span className="text-xs font-bold text-forge-blue uppercase tracking-widest">
            ✦ Applying for: {job?.title ?? '…'}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">Job Application</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Step {step + 1} of {STEPS.length} — {STEPS[step].label}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-forge-blue rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <div className="hidden sm:flex items-center justify-between mt-2">
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => i < step && setStep(i)}
                className={`flex flex-col items-center gap-0.5 ${i < step ? 'cursor-pointer' : 'cursor-default'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors ${
                  i < step ? 'bg-forge-blue text-white' :
                  i === step ? 'bg-forge-blue text-white ring-4 ring-blue-100 dark:ring-blue-900' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {i < step ? <Check size={10} /> : i + 1}
                </div>
                <span className={`text-xs ${i === step ? 'text-forge-blue font-semibold' : 'text-gray-400'}`}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── STEP 0: Resume Upload ── */}
        {step === 0 && (
          <div className="card p-5 sm:p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText size={20} className="text-forge-blue" /> Upload Your Resume
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Upload your resume — we'll automatically parse and pre-fill your application details.
              </p>
            </div>

            <div
              onDrop={handleDrop} onDragOver={e => e.preventDefault()}
              onClick={() => !busy && fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors group
                ${busy ? 'cursor-wait border-gray-200 dark:border-gray-700'
                       : 'cursor-pointer hover:border-forge-blue border-gray-300 dark:border-gray-700'}`}
            >
              {busy ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={32} className="text-forge-blue animate-spin" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {uploadMut.isPending && !parsing ? 'Uploading resume…' : 'Parsing with AI…'}
                  </p>
                  <p className="text-xs text-gray-400">This may take a few seconds</p>
                </div>
              ) : resumeName ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <FileText size={26} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{resumeName}</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      {prefilled ? '✓ Uploaded & fields pre-filled' : '✓ Uploaded successfully'}
                    </p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
                    className="text-xs text-forge-blue hover:underline">
                    Replace resume
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center
                    group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Upload size={26} className="text-forge-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Drag & drop or click to upload</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX · Max 20 MB</p>
                  </div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={e => handleFile(e.target.files[0])} />

            {prefilled && (
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-xs text-green-700 dark:text-green-300">
                <Sparkles size={14} className="flex-shrink-0" />
                Fields pre-filled from your resume. Review and edit them in the next steps.
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: Personal Information ── */}
        {step === 1 && (
          <div className="card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <User size={18} className="text-forge-blue" /> Personal Information
              </h2>
              {prefilled && (
                <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles size={10} /> Pre-filled
                </span>
              )}
            </div>
            <div className={G}>
              <div className="sm:col-span-2">
                <label className={L}>Full Name *</label>
                <input className={I} value={personal.fullName}
                  onChange={e => setPersonal(p => ({ ...p, fullName: e.target.value }))} placeholder="Alex Sterling" />
              </div>
              <div>
                <label className={L}>Email Address *</label>
                <input className={I} type="email" value={personal.email}
                  onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))} placeholder="alex@example.com" />
                {!personal.email && (
                  <p className="text-xs text-red-500 mt-1">Email is required to submit your application</p>
                )}
              </div>
              <div>
                <label className={L}>Phone Number</label>
                <input className={I} value={personal.phone}
                  onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
              <div className="sm:col-span-2">
                <label className={L}>Location</label>
                <input className={I} value={personal.location}
                  onChange={e => setPersonal(p => ({ ...p, location: e.target.value }))} placeholder="Bangalore, Karnataka" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Education ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BookOpen size={18} className="text-forge-blue" /> Education
              </h2>
              {prefilled && (
                <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles size={10} /> Pre-filled
                </span>
              )}
            </div>
            {education.map((edu, i) => (
              <div key={i} className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">Education #{i + 1}</p>
                  {education.length > 1 && (
                    <button onClick={() => removeEdu(i)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                  )}
                </div>
                <div className={G}>
                  <div>
                    <label className={L}>Degree</label>
                    <input className={I} value={edu.degree}
                      onChange={e => updateEdu(i, 'degree', e.target.value)} placeholder="B.Tech, M.Sc, MBA…" />
                  </div>
                  <div>
                    <label className={L}>University / College</label>
                    <input className={I} value={edu.university}
                      onChange={e => updateEdu(i, 'university', e.target.value)} placeholder="IIT Bangalore…" />
                  </div>
                  <div>
                    <label className={L}>Graduation Year</label>
                    <input className={I} type="number" value={edu.graduationYear}
                      onChange={e => updateEdu(i, 'graduationYear', e.target.value)} placeholder="2022" />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addEdu} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
              <Plus size={15} /> Add Another Education
            </button>
          </div>
        )}

        {/* ── STEP 3: Experience ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Briefcase size={18} className="text-forge-blue" /> Work Experience
              </h2>
              {prefilled && (
                <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles size={10} /> Pre-filled
                </span>
              )}
            </div>
            <div className="card p-4">
              <label className={L}>Total Experience (years)</label>
              <input className={I} type="number" step="0.5" value={totalExp}
                onChange={e => setTotalExp(e.target.value)} placeholder="3.5" />
            </div>
            {experience.map((exp, i) => (
              <div key={i} className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                    {i === 0 ? 'Current / Most Recent' : `Experience #${i + 1}`}
                  </p>
                  {experience.length > 1 && (
                    <button onClick={() => removeExp(i)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                  )}
                </div>
                <div className={G}>
                  <div>
                    <label className={L}>Company</label>
                    <input className={I} value={exp.company}
                      onChange={e => updateExp(i, 'company', e.target.value)} placeholder="Google, Infosys…" />
                  </div>
                  <div>
                    <label className={L}>Job Title</label>
                    <input className={I} value={exp.title}
                      onChange={e => updateExp(i, 'title', e.target.value)} placeholder="Software Engineer…" />
                  </div>
                  <div>
                    <label className={L}>Start Date</label>
                    <input className={I} type="date" value={exp.startDate}
                      onChange={e => updateExp(i, 'startDate', e.target.value)} />
                  </div>
                  <div>
                    <label className={L}>End Date</label>
                    <input className={I} type="date" value={exp.endDate} disabled={exp.current}
                      onChange={e => updateExp(i, 'endDate', e.target.value)} />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={exp.current}
                    onChange={e => updateExp(i, 'current', e.target.checked)} className="accent-forge-blue w-4 h-4" />
                  Currently working here
                </label>
                <div>
                  <label className={L}>Responsibilities</label>
                  <textarea className={I} rows={3} value={exp.description}
                    onChange={e => updateExp(i, 'description', e.target.value)}
                    placeholder="Key responsibilities and achievements…" />
                </div>
              </div>
            ))}
            <button onClick={addExp} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
              <Plus size={15} /> Add Previous Company
            </button>
          </div>
        )}

        {/* ── STEP 4: Social Links ── */}
        {step === 4 && (
          <div className="card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <LinkIcon size={18} className="text-forge-blue" /> Professional Links
              </h2>
              {prefilled && (
                <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles size={10} /> Pre-filled
                </span>
              )}
            </div>
            {[
              { key: 'linkedin',  label: 'LinkedIn URL',     placeholder: 'https://linkedin.com/in/username' },
              { key: 'github',    label: 'GitHub URL',       placeholder: 'https://github.com/username' },
              { key: 'portfolio', label: 'Portfolio / Blog', placeholder: 'https://yoursite.com' },
              { key: 'other',     label: 'Other Link',       placeholder: 'https://…' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className={L}>{label}</label>
                <input className={I} value={links[key]}
                  onChange={e => setLinks(l => ({ ...l, [key]: e.target.value }))} placeholder={placeholder} />
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 5: Questions ── */}
        {step === 5 && (
          <div className="card p-5 sm:p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <HelpCircle size={18} className="text-forge-blue" /> Application Questions
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">These questions help the hiring team assess your fit.</p>
            </div>
            <div className={G}>
              <div>
                <label className={L}>Legally authorized to work? *</label>
                <select className={I} value={gridQ.legallyAuthorized}
                  onChange={e => setGridQ(g => ({ ...g, legallyAuthorized: e.target.value }))}>
                  <option value="">Select…</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className={L}>Notice Period (days)</label>
                <select className={I} value={gridQ.noticePeriod}
                  onChange={e => setGridQ(g => ({ ...g, noticePeriod: e.target.value }))}>
                  {['0','15','30','45','60','90'].map(n => <option key={n} value={n}>{n} days</option>)}
                </select>
              </div>
              <div>
                <label className={L}>Current CTC (Annual)</label>
                <input className={I} value={gridQ.currentCtc}
                  onChange={e => setGridQ(g => ({ ...g, currentCtc: e.target.value }))} placeholder="1200000" />
              </div>
              <div>
                <label className={L}>Expected CTC (Annual)</label>
                <input className={I} value={gridQ.expectedCtc}
                  onChange={e => setGridQ(g => ({ ...g, expectedCtc: e.target.value }))} placeholder="1800000" />
              </div>
              <div>
                <label className={L}>Current Location</label>
                <input className={I} value={gridQ.currentLocation}
                  onChange={e => setGridQ(g => ({ ...g, currentLocation: e.target.value }))} placeholder="Bangalore, KA" />
              </div>
              <div>
                <label className={L}>Preferred Location</label>
                <input className={I} value={gridQ.preferredLocation}
                  onChange={e => setGridQ(g => ({ ...g, preferredLocation: e.target.value }))} placeholder="Bangalore / Remote" />
              </div>
              <div>
                <label className={L}>Willing to Relocate?</label>
                <select className={I} value={gridQ.willingToRelocate}
                  onChange={e => setGridQ(g => ({ ...g, willingToRelocate: e.target.value }))}>
                  <option value="">Select…</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="maybe">Open to discussion</option>
                </select>
              </div>
            </div>
            <div>
              <label className={L}>Additional Comments</label>
              <textarea className={I} rows={4} value={gridQ.additionalComments}
                onChange={e => setGridQ(g => ({ ...g, additionalComments: e.target.value }))}
                placeholder="Anything else you'd like the hiring team to know…" />
            </div>
          </div>
        )}

        {/* ── STEP 6: Review & Submit ── */}
        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Review & Submit</h2>

            <div className="card p-4 space-y-1.5">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">Personal Information</p>
              {[
                ['Name',     personal.fullName],
                ['Email',    personal.email],
                ['Phone',    personal.phone],
                ['Location', personal.location],
              ].map(([lbl, val]) => (
                <p key={lbl} className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{lbl}:</span> {val || <span className="text-gray-400 italic">not provided</span>}
                </p>
              ))}
              {!personal.email && (
                <p className="text-xs text-red-500 mt-1">⚠ Email is required — go back to Personal Info to add it.</p>
              )}
            </div>

            <div className="card p-4 space-y-1">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">Education</p>
              {education.map((e, i) => (
                <p key={i} className="text-sm text-gray-600 dark:text-gray-400">
                  {e.degree || '—'} — {e.university || '—'}{e.graduationYear ? ` (${e.graduationYear})` : ''}
                </p>
              ))}
            </div>

            <div className="card p-4 space-y-1">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">Experience</p>
              {experience.map((e, i) => (
                <p key={i} className="text-sm text-gray-600 dark:text-gray-400">
                  {e.title || '—'} at {e.company || '—'}{e.current ? ' (Current)' : ''}
                </p>
              ))}
              {totalExp && <p className="text-xs text-gray-400 mt-1">Total: {totalExp} years</p>}
            </div>

            <div className="card p-4">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">Resume</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{resumeName || <span className="italic text-gray-400">No resume uploaded</span>}</p>
            </div>

            <div className="card p-4 space-y-1">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">Application Questions</p>
              {[
                ['Work Authorization', gridQ.legallyAuthorized],
                ['Notice Period',      gridQ.noticePeriod + ' days'],
                ['Current CTC',        gridQ.currentCtc],
                ['Expected CTC',       gridQ.expectedCtc],
                ['Relocate',           gridQ.willingToRelocate],
              ].map(([lbl, val]) => val ? (
                <p key={lbl} className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{lbl}:</span> {val}
                </p>
              ) : null)}
            </div>

            {/* Declaration */}
            <div className="card p-5 space-y-3">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Declaration *</h3>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={declarationAccepted}
                  onChange={e => setDeclarationAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-forge-blue" />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    I confirm that all information provided is accurate and complete.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    I consent to my personal data being processed for recruitment purposes.
                  </p>
                </div>
              </label>
              {!declarationAccepted && (
                <p className="text-xs text-red-500">* Please accept the declaration to submit.</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button onClick={step > 0 ? goPrev : () => navigate(-1)}
            className="btn-secondary flex items-center gap-2">
            <ChevronLeft size={16} />{step > 0 ? 'Back' : 'Cancel'}
          </button>
          <span className="text-xs text-gray-400">{step + 1} / {STEPS.length}</span>

          {step < STEPS.length - 1 ? (
            <button onClick={goNext}
              disabled={(step === 0 && !resumeName) || busy}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {busy
                ? <><Loader2 size={14} className="animate-spin" /> Processing…</>
                : step === 0 && !resumeName
                  ? 'Upload Resume to Continue'
                  : <>Continue <ChevronRight size={16} /></>
              }
            </button>
          ) : (
            <button
              onClick={() => applyMut.mutate()}
              disabled={!declarationAccepted || !personal.email || applyMut.isPending}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!personal.email ? 'Email required — go back to Personal Info' : ''}
            >
              {applyMut.isPending
                ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                : <><Check size={16} /> Submit Application</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
