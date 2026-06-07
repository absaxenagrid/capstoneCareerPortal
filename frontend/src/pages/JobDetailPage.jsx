import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { jobApi } from '../services/api'
import { MapPin, ArrowLeft, DollarSign, Briefcase, Clock, Calendar, Globe, Users, ChevronRight, Share2, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

// REQ-JP-09: generate a URL-safe slug from job title + id
export function makeSlug(title, id) {
  const base = (title ?? 'job')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
  return `${base}-${id}`
}

// Extract numeric id from slug (everything after last dash that's a number)
export function idFromSlug(slug) {
  if (!slug) return null
  const parts = slug.split('-')
  const last  = parts[parts.length - 1]
  return /^\d+$/.test(last) ? last : slug  // fallback: treat whole slug as id
}

export default function JobDetailPage() {
  const { slug }  = useParams()   // /careers/:slug  OR  /jobs/:jobId (legacy)
  const jobId     = idFromSlug(slug)
  const navigate  = useNavigate()

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['job', jobId],
    queryFn:  () => jobApi.getById(jobId).then(r => r.data),
    enabled:  !!jobId,
  })

  if (isLoading) return (
    <div className="p-6 sm:p-8 max-w-4xl space-y-4 animate-pulse" aria-label="Loading job details">
      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4"/>
      <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-2/3"/>
      <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded"/>
    </div>
  )

  if (isError || !job) return (
    <div className="p-8 text-center" role="alert">
      <p className="text-gray-500 text-lg mb-4">Job not found.</p>
      <button onClick={() => navigate('/jobs')} className="btn-primary">Back to Jobs</button>
    </div>
  )

  // Normalise all fields
  const location   = job.location ?? [job.location_city,job.location_state,job.location_country].filter(Boolean).join(', ') ?? job.work_mode ?? job.workMode ?? ''
  const salary     = job.salary_range ?? (job.salary_min && job.salary_max ? `$${Math.round(job.salary_min/1000)}k – $${Math.round(job.salary_max/1000)}k` : job.salary ?? '')
  const empType    = job.employment_type ?? job.jobType ?? job.job_type ?? ''
  const experience = job.experience_required ?? job.experience ?? ''
  const deadline   = job.application_deadline ?? job.deadline ?? ''
  const posted     = job.posted_at ?? job.createdAt ?? job.created_at ?? ''
  const teamSize   = job.team_size ?? ''
  const rawSkills  = job.skills ?? job.required_skills ?? job.requiredSkills ?? []
  const skills     = rawSkills.map(s => typeof s==='string' ? s : s.name ?? String(s))
  const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities
    : typeof job.responsibilities==='string' ? job.responsibilities.split(/\.\s+/).filter(Boolean) : []
  const benefits = Array.isArray(job.benefits) ? job.benefits
    : typeof job.benefits==='string' ? job.benefits.split(/\.\s+/).filter(Boolean) : []
  const requirements = Array.isArray(job.requirements) ? job.requirements
    : typeof job.requirements==='string' ? job.requirements.split(/\.\s+/).filter(Boolean) : []

  const canonicalSlug = makeSlug(job.title, jobId)
  const canonicalUrl  = `${window.location.origin}/careers/${canonicalSlug}`
  const metaDesc      = job.description
    ? job.description.slice(0, 160).replace(/\s+\S*$/, '') + '…'
    : `${job.title} at Grid Dynamics — ${location ? location + ' · ' : ''}${empType || 'Full-time'}`

  // REQ-JP-09: JSON-LD JobPosting schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description ?? '',
    identifier: { '@type': 'PropertyValue', name: 'Grid Dynamics', value: String(jobId) },
    datePosted: posted ? new Date(posted).toISOString().slice(0,10) : new Date().toISOString().slice(0,10),
    validThrough: deadline ? new Date(deadline).toISOString().slice(0,10) : undefined,
    employmentType: empType?.toUpperCase().replace(/[-\s]/g,'_') || 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company ?? job.company_name ?? 'Grid Dynamics',
      sameAs: 'https://www.griddynamics.com',
    },
    jobLocation: location ? {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: location }
    } : undefined,
    baseSalary: (job.salary_min && job.salary_max) ? {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: { '@type': 'QuantitativeValue', minValue: job.salary_min, maxValue: job.salary_max, unitText: 'YEAR' }
    } : undefined,
    skills: skills.join(', ') || undefined,
    url: canonicalUrl,
  }
  // Remove undefined keys
  Object.keys(jsonLd).forEach(k => jsonLd[k] === undefined && delete jsonLd[k])

  function safeDate(d) {
    try { return new Date(d).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) }
    catch { return d }
  }

  const applyUrl = `/careers/${canonicalSlug}/apply`

  const copyLink = () => {
    navigator.clipboard.writeText(canonicalUrl).then(() => toast.success('Link copied!'))
  }

  return (
    <>
      <Helmet>
        <title>{job.title} — Forge Careers</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title"       content={`${job.title} — Forge Careers`} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url"         content={canonicalUrl} />
        <meta property="og:type"        content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Skip link */}
      <a href="#job-detail-main"
         className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-forge-blue focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold">
        Skip to job details
      </a>

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex items-center gap-1 text-sm text-gray-500">
            <li><Link to="/jobs" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-forge-blue rounded">Jobs</Link></li>
            <li aria-hidden="true" className="text-gray-300 dark:text-gray-600">/</li>
            <li><span className="text-gray-900 dark:text-gray-100 font-medium" aria-current="page">{job.title}</span></li>
          </ol>
        </nav>

        {/* Header */}
        <div className="card p-5 sm:p-6 mb-5" id="job-detail-main">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-forge-blue uppercase tracking-widest mb-2">
                {job.department ?? job.category ?? 'Engineering'}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">{job.title}</h1>
              {(job.company ?? job.company_name) && (
                <p className="text-base font-medium text-gray-600 dark:text-gray-400 mb-3">{job.company ?? job.company_name}</p>
              )}
              <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                {location   && <span className="flex items-center gap-1.5"><MapPin size={14} aria-hidden="true"/>{location}</span>}
                {salary     && <span className="flex items-center gap-1.5"><DollarSign size={14} aria-hidden="true"/>{salary}</span>}
                {empType    && <span className="flex items-center gap-1.5"><Briefcase size={14} aria-hidden="true"/>{empType}</span>}
                {experience && <span className="flex items-center gap-1.5"><Clock size={14} aria-hidden="true"/>{experience}</span>}
                {teamSize   && <span className="flex items-center gap-1.5"><Users size={14} aria-hidden="true"/>{teamSize} team</span>}
                {deadline   && <span className="flex items-center gap-1.5 text-orange-500 dark:text-orange-400"><Calendar size={14} aria-hidden="true"/>Deadline: {safeDate(deadline)}</span>}
                {posted     && <span className="flex items-center gap-1.5"><Globe size={14} aria-hidden="true"/>Posted: {safeDate(posted)}</span>}
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <button
                onClick={copyLink}
                aria-label="Copy job link"
                className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-forge-blue"
                title="Copy link to this job"
              >
                <Copy size={16} aria-hidden="true" />
              </button>
              <Link
                to={applyUrl}
                className="btn-primary px-6 py-3 sm:py-2.5 text-sm whitespace-nowrap"
                aria-label={`Apply now for ${job.title}`}
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="rounded-xl h-36 sm:h-44 bg-gradient-to-br from-slate-800 to-blue-900 mb-5 flex items-end p-5" aria-hidden="true">
          <p className="text-white text-sm italic opacity-70">{job.tagline ?? 'Join the team building the future.'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main */}
          <div className="lg:col-span-2 space-y-4">
            {job.description && (
              <section className="card p-5" aria-labelledby="role-summary-heading">
                <h2 id="role-summary-heading" className="section-title mb-3">Role Summary</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{job.description}</p>
              </section>
            )}

            {responsibilities.length > 0 && (
              <section className="card p-5" aria-labelledby="responsibilities-heading">
                <h2 id="responsibilities-heading" className="section-title mb-4">Key Responsibilities</h2>
                <ul className="space-y-2" aria-label="Key responsibilities">
                  {responsibilities.map((r,i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-forge-blue mt-1.5 flex-shrink-0" aria-hidden="true"/>
                      {typeof r==='string' ? r : (r.title ?? String(r))}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {requirements.length > 0 && (
              <section className="card p-5" aria-labelledby="requirements-heading">
                <h2 id="requirements-heading" className="section-title mb-4">Requirements</h2>
                <ul className="space-y-2" aria-label="Job requirements">
                  {requirements.map((r,i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <ChevronRight size={14} className="text-forge-blue mt-0.5 flex-shrink-0" aria-hidden="true"/>
                      {typeof r==='string' ? r : String(r)}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {benefits.length > 0 && (
              <section className="card p-5" aria-labelledby="benefits-heading">
                <h2 id="benefits-heading" className="section-title mb-3">Benefits &amp; Perks</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2" aria-label="Benefits and perks">
                  {benefits.map((b,i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5">
                      <span className="text-green-500" aria-hidden="true">✓</span>
                      {typeof b==='string' ? b : String(b)}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="card p-5 mb-4" aria-labelledby="hiring-process-heading">
              <h2 id="hiring-process-heading" className="section-title mb-4">Hiring Process</h2>
              <ol className="space-y-3">
                {[
                  { step:'Initial Screening',      desc:'30-min call with Talent Acquisition.' },
                  { step:'Technical Assessment',   desc:'Deep-dive interview with engineering.' },
                  { step:'Final Round',            desc:'4-hour session covering leadership and coding.' },
                ].map(({step,desc}, i) => (
                  <li key={step} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-forge-blue text-white text-xs flex items-center justify-center font-bold flex-shrink-0" aria-hidden="true">{i+1}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{step}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Sidebar */}
          <aside aria-label="Job details sidebar" className="space-y-4">
            {skills.length > 0 && (
              <div className="card p-5">
                <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Required Skills</h2>
                <ul className="flex flex-wrap gap-2" aria-label="Required skills">
                  {skills.map((s,i) => (
                    <li key={i} className="badge bg-gray-900 dark:bg-gray-700 text-white text-xs px-2.5 py-1">{s}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="card p-5 space-y-3">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Quick Facts</h2>
              <dl>
                {[
                  { label: 'Location',   value: location },
                  { label: 'Salary',     value: salary },
                  { label: 'Type',       value: empType },
                  { label: 'Experience', value: experience },
                  { label: 'Deadline',   value: deadline ? safeDate(deadline) : '' },
                ].filter(f => f.value).map(({label, value}) => (
                  <div key={label} className="mb-3 last:mb-0">
                    <dt className="text-xs text-gray-400 dark:text-gray-500">{label}</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="card p-5 text-center">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 text-sm">Ready to apply?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Your profile will be pre-filled.</p>
              <Link to={applyUrl} className="btn-primary w-full py-2.5 text-sm block text-center"
                    aria-label={`Apply now for ${job.title}`}>
                Apply Now
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
