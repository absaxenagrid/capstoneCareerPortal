import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { applicationApi } from '../services/api'
import { useStore } from '../store'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { Search, ChevronUp, ChevronDown, Calendar, Briefcase, ExternalLink, RefreshCw } from 'lucide-react'

const STAGE_BADGE = {
  APPLIED:             'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
  SCREENING:           'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
  INTERVIEW:           'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
  TECHNICAL_INTERVIEW: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
  OFFER:               'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
  WITHDRAWN:           'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  REJECTED:            'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
}

const MOCK_APPLICATIONS = [
  { applicationId: 1, candidateEmail: 'candidate@example.com', jobId: 101, jobTitle: 'Senior AI Engineer', companyName: 'Forge AI', currentStage: 'TECHNICAL_INTERVIEW', appliedAt: '2024-10-12T09:00:00', lastUpdatedAt: '2024-10-18T11:00:00' },
  { applicationId: 2, candidateEmail: 'candidate@example.com', jobId: 102, jobTitle: 'Staff Product Designer', companyName: 'Linear', currentStage: 'SCREENING', appliedAt: '2024-10-08T14:00:00', lastUpdatedAt: '2024-10-10T09:00:00' },
  { applicationId: 3, candidateEmail: 'candidate@example.com', jobId: 103, jobTitle: 'Machine Learning Engineer', companyName: 'Anthropic', currentStage: 'APPLIED', appliedAt: '2024-09-28T11:00:00', lastUpdatedAt: '2024-09-28T11:00:00' },
]

function safeDate(str) {
  if (!str) return '—'
  try {
    const d = new Date(str)
    return isNaN(d) ? '—' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return '—' }
}

export default function PastApplicationsPage() {
  const navigate       = useNavigate()
  const qc             = useQueryClient()
  const candidateEmail = useStore(s => s.candidateEmail)

  const [search,   setSearch]   = useState('')
  const [sortKey,  setSortKey]  = useState('appliedAt')
  const [sortDir,  setSortDir]  = useState('desc')
  const [page,     setPage]     = useState(0)

  const PAGE_SIZE = 10

  const { data, isLoading } = useQuery({
    queryKey: ['past-applications', candidateEmail, page],
    queryFn:  () => applicationApi.getCandidateApplications(candidateEmail, page).then(r => r.data),
    enabled:  !!candidateEmail,
  })

  const applications = data?.content?.length ? data.content : MOCK_APPLICATIONS
  const totalPages   = data?.totalPages ?? 1

  // Filter by search
  const filtered = applications.filter(a => {
    const q = search.toLowerCase()
    return (
      (a.jobTitle || '').toLowerCase().includes(q) ||
      (a.companyName || '').toLowerCase().includes(q) ||
      (a.currentStage || '').toLowerCase().includes(q) ||
      String(a.applicationId).includes(q)
    )
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortKey] ?? ''
    let bVal = b[sortKey] ?? ''
    if (sortKey.endsWith('At')) { aVal = new Date(aVal); bVal = new Date(bVal) }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ k }) => sortKey === k
    ? (sortDir === 'asc' ? <ChevronUp size={12} className="text-forge-blue" /> : <ChevronDown size={12} className="text-forge-blue" />)
    : <ChevronDown size={12} className="text-gray-300 dark:text-gray-600" />

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Past Applications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">All applications submitted by you.</p>
        </div>
        <button onClick={() => navigate('/jobs')} className="btn-primary text-sm flex items-center gap-2 self-start sm:self-auto">
          <Briefcase size={15} /> Browse Jobs
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',       count: applications.length,                                                        color: 'text-gray-700 dark:text-gray-300' },
          { label: 'Applied',     count: applications.filter(a => a.currentStage === 'APPLIED').length,              color: 'text-blue-600 dark:text-blue-400' },
          { label: 'In Progress', count: applications.filter(a => ['SCREENING','INTERVIEW','TECHNICAL_INTERVIEW'].includes(a.currentStage)).length, color: 'text-purple-600 dark:text-purple-400' },
          { label: 'Offers',      count: applications.filter(a => a.currentStage === 'OFFER').length,                color: 'text-green-600 dark:text-green-400' },
        ].map(({ label, count, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by job title, company, status or Application ID…"
          className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-forge-blue text-gray-900 dark:text-gray-100 placeholder-gray-400"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              {search ? 'No applications match your search.' : "You haven't applied for any jobs yet."}
            </p>
            {!search && (
              <button onClick={() => navigate('/jobs')} className="btn-primary text-sm">Explore Jobs</button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    {[
                      { key: 'jobTitle',     label: 'Job Title' },
                      { key: 'applicationId',label: 'Application ID' },
                      { key: 'appliedAt',    label: 'Applied Date' },
                      { key: 'currentStage', label: 'Status' },
                      { key: 'lastUpdatedAt',label: 'Last Updated' },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        onClick={() => toggleSort(key)}
                        className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                      >
                        <span className="inline-flex items-center gap-1">{label}<SortIcon k={key} /></span>
                      </th>
                    ))}
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(app => (
                    <tr key={app.applicationId} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{app.jobTitle ?? `Job #${app.jobId}`}</p>
                        <p className="text-xs text-gray-400">{app.companyName ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">#{app.applicationId}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><Calendar size={11} />{safeDate(app.appliedAt)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', STAGE_BADGE[app.currentStage] ?? 'bg-gray-100 text-gray-600')}>
                          {(app.currentStage ?? '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{safeDate(app.lastUpdatedAt)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => navigate(`/jobs/${app.jobId}`)} className="text-forge-blue hover:text-forge-blue-dark" title="View Job">
                          <ExternalLink size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {sorted.map(app => (
                <div key={app.applicationId} className="p-4 flex items-start gap-3">
                  <div className="w-9 h-9 bg-forge-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase size={16} className="text-forge-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{app.jobTitle ?? `Job #${app.jobId}`}</p>
                    <p className="text-xs text-gray-500">{app.companyName}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', STAGE_BADGE[app.currentStage])}>
                        {(app.currentStage ?? '').replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">#{app.applicationId}</span>
                      <span className="text-xs text-gray-400">{safeDate(app.appliedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-30"
                >
                  ← Previous
                </button>
                <span className="text-xs text-gray-500">Page {page + 1} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
