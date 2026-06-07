import { Link } from 'react-router-dom'
import { MapPin, DollarSign, Briefcase, Clock, Calendar } from 'lucide-react'

function jobSlug(job) {
  const id    = job.id ?? job._id
  const title = job.title ?? 'job'
  const base  = title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').slice(0,60)
  return `${base}-${id}`
}

export default function JobCard({ job }) {
  const slug       = jobSlug(job)
  const title      = job.title ?? 'Untitled'
  const company    = job.company ?? job.company_name ?? job.department ?? ''
  const location   = job.location
    ?? [job.location_city, job.location_state].filter(Boolean).join(', ')
    ?? job.work_mode ?? job.workMode ?? ''
  const salary     = job.salary_range
    ?? (job.salary_min && job.salary_max
        ? `$${Math.round(job.salary_min/1000)}k – $${Math.round(job.salary_max/1000)}k`
        : job.salary ?? '')
  const empType    = job.employment_type ?? job.jobType ?? job.job_type ?? ''
  const experience = job.experience_required ?? job.experience ?? ''
  const deadline   = job.application_deadline ?? job.deadline ?? ''
  const rawSkills  = job.skills ?? job.required_skills ?? job.requiredSkills ?? []
  const skills     = rawSkills.map(s => typeof s==='string' ? s : s.name ?? String(s)).slice(0,3)
  const isNew      = deadline && new Date(deadline) > new Date()

  function safeDate(d) {
    try { return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) }
    catch { return d }
  }

  return (
    <article
      className="card p-4 sm:p-5 hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col gap-3 group"
      aria-label={`${title}${company ? ` at ${company}` : ''}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-forge-blue/10 dark:bg-forge-blue/20 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <Briefcase size={18} className="text-forge-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-snug line-clamp-2">{title}</h3>
            {isNew && (
              <span className="badge bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 flex-shrink-0 text-xs" aria-label="New listing">New</span>
            )}
          </div>
          {company && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{company}</p>}
        </div>
      </div>

      {/* Meta */}
      <dl className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        {location   && <div><dt className="sr-only">Location</dt><dd className="flex items-center gap-1"><MapPin size={11} aria-hidden="true"/>{location}</dd></div>}
        {salary     && <div><dt className="sr-only">Salary</dt><dd className="flex items-center gap-1"><DollarSign size={11} aria-hidden="true"/>{salary}</dd></div>}
        {empType    && <div><dt className="sr-only">Employment type</dt><dd className="flex items-center gap-1"><Briefcase size={11} aria-hidden="true"/>{empType}</dd></div>}
        {experience && <div><dt className="sr-only">Experience required</dt><dd className="flex items-center gap-1"><Clock size={11} aria-hidden="true"/>{experience}</dd></div>}
      </dl>

      {/* Skills */}
      {skills.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Required skills">
          {skills.map((s,i) => (
            <li key={i} className="badge bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">{s}</li>
          ))}
          {rawSkills.length > 3 && (
            <li className="badge bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs">+{rawSkills.length-3}</li>
          )}
        </ul>
      )}

      {/* Deadline */}
      {deadline && (
        <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
          <Calendar size={11} aria-hidden="true"/>
          <span><span className="sr-only">Application deadline: </span>{safeDate(deadline)}</span>
        </p>
      )}

      {/* REQ-JP-09: slug-based URL */}
      <Link
        to={`/careers/${slug}`}
        className="btn-primary text-center text-sm py-2 mt-auto block focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-forge-blue"
        aria-label={`View and apply for ${title}`}
      >
        View &amp; Apply
      </Link>
    </article>
  )
}
