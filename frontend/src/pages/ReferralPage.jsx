import { useState, useId } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '../store'
import { jobApi } from '../services/api'
import { Link2, Copy, Check, User, ChevronDown, Share2, BarChart2, Clock, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

const L = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide'
const I = 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-forge-blue text-gray-900 dark:text-gray-100 placeholder-gray-400'

function generateToken() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
}

function makeSlug(title, id) {
  const base = (title ?? 'job').toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').slice(0,60)
  return `${base}-${id}`
}

export default function ReferralPage() {
  const referrals            = useStore(s => s.referrals)
  const addReferral          = useStore(s => s.addReferral)
  const candidateEmail       = useStore(s => s.candidateEmail)
  const emailId              = useId()
  const jobSelectId          = useId()

  const [referrerEmail, setReferrerEmail] = useState(candidateEmail !== 'candidate@example.com' ? candidateEmail : '')
  const [selectedJobId, setSelectedJobId] = useState('')
  const [copiedToken,   setCopiedToken]   = useState(null)

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn:  () => jobApi.getAll().then(r => r.data),
  })

  const selectedJob = jobs.find(j => String(j.id ?? j._id) === selectedJobId)

  const generateLink = () => {
    if (!referrerEmail.trim()) { toast.error('Enter your email first'); return }
    if (!selectedJobId)        { toast.error('Select a job posting'); return }
    if (!selectedJob)          { toast.error('Job not found'); return }

    const token  = generateToken()
    const slug   = makeSlug(selectedJob.title, selectedJobId)
    const url    = `${window.location.origin}/careers/${slug}/apply?ref=${token}`

    addReferral(token, {
      jobId:         selectedJobId,
      jobTitle:      selectedJob.title,
      slug,
      referrerEmail: referrerEmail.trim(),
      createdAt:     new Date().toISOString(),
      clicks:        0,
      url,
    })

    toast.success('Referral link created!')
  }

  const copyLink = (url, token) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopiedToken(null), 2500)
    })
  }

  const myReferrals = Object.entries(referrals)
    .filter(([, r]) => r.referrerEmail === referrerEmail.trim())
    .sort(([, a], [, b]) => new Date(b.createdAt) - new Date(a.createdAt))

  const allReferrals = Object.entries(referrals)
    .sort(([, a], [, b]) => new Date(b.createdAt) - new Date(a.createdAt))

  function safeDate(d) {
    try { return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) }
    catch { return d }
  }

  return (
    <>
      <Helmet>
        <title>Referral Links — Forge Careers</title>
        <meta name="description" content="Generate unique referral links for open positions. Track referred candidates through the hiring pipeline." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        <div className="mb-6">
          <p className="text-xs font-bold text-forge-blue uppercase tracking-widest mb-1">Engineer Portal</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Referral Links</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generate a unique referral URL per job posting. Candidates who apply via your link are tracked as <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">REFERRAL</code> source through to hire.
          </p>
        </div>

        {/* Generator card */}
        <section className="card p-5 mb-6" aria-labelledby="generate-heading">
          <h2 id="generate-heading" className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Link2 size={16} className="text-forge-blue" aria-hidden="true"/> Generate New Referral Link
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor={emailId} className={L}>Your Email</label>
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"/>
                <input
                  id={emailId}
                  type="email"
                  className={`${I} pl-9`}
                  value={referrerEmail}
                  onChange={e => setReferrerEmail(e.target.value)}
                  placeholder="you@griddynamics.com"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label htmlFor={jobSelectId} className={L}>Job Posting</label>
              <div className="relative">
                <select
                  id={jobSelectId}
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className={I}
                  disabled={isLoading}
                >
                  <option value="">— Select a position —</option>
                  {jobs.map(j => (
                    <option key={j.id ?? j._id} value={String(j.id ?? j._id)}>
                      {j.title}{j.department ? ` · ${j.department}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {selectedJob && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4 text-sm text-blue-800 dark:text-blue-200">
              <strong>{selectedJob.title}</strong>
              {selectedJob.location && <span className="text-blue-600 dark:text-blue-300 ml-2">· {selectedJob.location}</span>}
            </div>
          )}

          <button
            onClick={generateLink}
            disabled={!referrerEmail || !selectedJobId}
            className="btn-primary flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-forge-blue disabled:opacity-50"
            aria-label="Generate referral link"
          >
            <Share2 size={15} aria-hidden="true"/> Generate Link
          </button>
        </section>

        {/* My referral links */}
        {myReferrals.length > 0 && (
          <section className="card p-5 mb-6" aria-labelledby="my-links-heading">
            <h2 id="my-links-heading" className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-forge-blue" aria-hidden="true"/> My Referral Links
            </h2>
            <ul className="space-y-3">
              {myReferrals.map(([token, ref]) => (
                <li key={token} className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{ref.jobTitle}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock size={11} aria-hidden="true"/> {safeDate(ref.createdAt)}
                        </span>
                        <span className="text-xs text-forge-blue font-semibold">
                          {ref.clicks} click{ref.clicks !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded truncate max-w-xs block">
                          {ref.url}
                        </code>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <a href={ref.url} target="_blank" rel="noopener noreferrer"
                         className="p-2 rounded border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-forge-blue"
                         aria-label={`Open referral link for ${ref.jobTitle}`}>
                        <ExternalLink size={14} aria-hidden="true"/>
                      </a>
                      <button
                        onClick={() => copyLink(ref.url, token)}
                        className="p-2 rounded border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-forge-blue"
                        aria-label={`Copy referral link for ${ref.jobTitle}`}
                      >
                        {copiedToken === token
                          ? <Check size={14} className="text-green-500" aria-hidden="true"/>
                          : <Copy size={14} aria-hidden="true"/>}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* All referrals — summary table */}
        {allReferrals.length > 0 && (
          <section className="card p-5" aria-labelledby="all-referrals-heading">
            <h2 id="all-referrals-heading" className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
              All Generated Links
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="All referral links">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th scope="col" className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide pb-2 pr-4">Position</th>
                    <th scope="col" className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide pb-2 pr-4">Referrer</th>
                    <th scope="col" className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide pb-2 pr-4">Created</th>
                    <th scope="col" className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide pb-2">Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {allReferrals.map(([token, ref]) => (
                    <tr key={token} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-2.5 pr-4 font-medium text-gray-900 dark:text-gray-100">{ref.jobTitle}</td>
                      <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400">{ref.referrerEmail}</td>
                      <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400">{safeDate(ref.createdAt)}</td>
                      <td className="py-2.5 text-right font-semibold text-forge-blue">{ref.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {allReferrals.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Share2 size={40} className="mx-auto mb-3 opacity-30" aria-hidden="true"/>
            <p className="text-sm">No referral links generated yet. Create one above.</p>
          </div>
        )}
      </div>
    </>
  )
}
