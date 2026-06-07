import { useState, useEffect, useId } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { HelmetProvider, Helmet } from 'react-helmet-async'
import { jobApi } from '../services/api'
import JobCard from '../components/jobs/JobCard'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react'

const PAGE_SIZE = 9

// Derive a seniority label from job fields
function getSeniority(job) {
  const text = `${job.title ?? ''} ${job.experience_required ?? job.experience ?? ''}`.toLowerCase()
  if (/principal|staff|director|vp |head of/i.test(text)) return 'Principal'
  if (/senior|sr\.|lead/i.test(text))  return 'Senior'
  if (/junior|jr\.|entry|fresher/i.test(text)) return 'Junior'
  if (/intern/i.test(text)) return 'Intern'
  return 'Mid-level'
}

// Derive a canonical location string
function getLocation(job) {
  return job.location
    ?? [job.location_city, job.location_state, job.location_country].filter(Boolean).join(', ')
    ?? job.work_mode ?? job.workMode ?? ''
}

const SENIORITY_OPTIONS = ['All Levels', 'Intern', 'Junior', 'Mid-level', 'Senior', 'Principal']
const WORK_MODE_OPTIONS  = ['All Modes', 'Remote', 'Hybrid', 'Onsite']

export default function FeaturedJobsPage() {
  const [searchParams] = useSearchParams()
  const searchId   = useId()
  const locationId = useId()
  const seniorId   = useId()
  const workModeId = useId()

  const [search,     setSearch]     = useState(searchParams.get('q') ?? '')
  const [location,   setLocation]   = useState('')
  const [seniority,  setSeniority]  = useState('')
  const [workMode,   setWorkMode]   = useState('')
  const [page,       setPage]       = useState(1)

  useEffect(() => {
    const q = searchParams.get('q'); if (q) setSearch(q)
  }, []) // eslint-disable-line

  const { data: allJobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn:  () => jobApi.getAll().then(r => r.data),
  })

  // Derive unique location options from data
  const locationOptions = ['All Locations', ...new Set(
    allJobs.map(j => getLocation(j)).filter(Boolean).map(l => l.split(',')[0].trim())
  )].slice(0, 12)

  const filtered = allJobs.filter(j => {
    const haystack    = `${j.title} ${j.department ?? j.company ?? ''} ${j.description ?? ''}`.toLowerCase()
    const textMatch   = !search    || haystack.includes(search.toLowerCase())
    const locField    = getLocation(j).toLowerCase()
    const locMatch    = !location  || location === 'All Locations' || locField.includes(location.toLowerCase())
    const seniorMatch = !seniority || seniority === 'All Levels'   || getSeniority(j) === seniority
    const modeField   = (j.workMode ?? j.work_mode ?? j.location ?? '').toLowerCase()
    const modeMatch   = !workMode  || workMode === 'All Modes'     || modeField.includes(workMode.toLowerCase())
    return textMatch && locMatch && seniorMatch && modeMatch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetFilters = () => { setSearch(''); setLocation(''); setSeniority(''); setWorkMode(''); setPage(1) }
  const hasFilters   = search || location || seniority || workMode

  const applySearch = () => setPage(1)

  return (
    <>
      <Helmet>
        <title>Open Positions — Forge Careers</title>
        <meta name="description" content="Browse all open engineering, product, and design roles at Grid Dynamics. Filter by location, seniority, and work mode." />
      </Helmet>

      {/* Skip to main content — WCAG 2.4.1 */}
      <a href="#job-results"
         className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-forge-blue focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold">
        Skip to job listings
      </a>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Open Positions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1" aria-live="polite" aria-atomic="true">
            {isLoading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'opportunity' : 'opportunities'} found`}
          </p>
        </div>

        {/* ── Search ─────────────────────────────────────────────── */}
        <div role="search" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 sm:p-4 mb-4">
          <label htmlFor={searchId} className="sr-only">Search by title, company, or skill</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                id={searchId}
                type="search"
                placeholder="Search by title, company, skill…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applySearch()}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-forge-blue text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
            </div>
            <button onClick={applySearch} className="btn-primary px-5 py-2 text-sm whitespace-nowrap">Search</button>
          </div>
        </div>

        {/* ── Filters ────────────────────────────────────────────── */}
        <div role="group" aria-label="Job filters" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 sm:p-4 mb-6">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            <SlidersHorizontal size={13} aria-hidden="true" /> Filters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Location filter */}
            <div>
              <label htmlFor={locationId} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Location
              </label>
              <select
                id={locationId}
                value={location}
                onChange={e => { setLocation(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-forge-blue text-gray-900 dark:text-gray-100"
              >
                {locationOptions.map(o => <option key={o} value={o === 'All Locations' ? '' : o}>{o}</option>)}
              </select>
            </div>

            {/* Seniority filter */}
            <div>
              <label htmlFor={seniorId} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Seniority
              </label>
              <select
                id={seniorId}
                value={seniority}
                onChange={e => { setSeniority(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-forge-blue text-gray-900 dark:text-gray-100"
              >
                {SENIORITY_OPTIONS.map(o => <option key={o} value={o === 'All Levels' ? '' : o}>{o}</option>)}
              </select>
            </div>

            {/* Work mode filter */}
            <div>
              <label htmlFor={workModeId} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Work Mode
              </label>
              <select
                id={workModeId}
                value={workMode}
                onChange={e => { setWorkMode(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-forge-blue text-gray-900 dark:text-gray-100"
              >
                {WORK_MODE_OPTIONS.map(o => <option key={o} value={o === 'All Modes' ? '' : o}>{o}</option>)}
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 hover:underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
              >
                <X size={12} aria-hidden="true" /> Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* ── Results ────────────────────────────────────────────── */}
        <main id="job-results">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Loading job listings">
              {Array(PAGE_SIZE).fill(0).map((_, i) => (
                <div key={i} className="card h-52 animate-pulse bg-gray-100 dark:bg-gray-800" aria-hidden="true" />
              ))}
            </div>
          ) : paged.length === 0 ? (
            <div className="text-center py-20 text-gray-400" role="status">
              <p className="text-xl font-semibold mb-2 text-gray-600 dark:text-gray-300">No jobs found</p>
              <p className="text-sm mb-4">Try different keywords or adjust your filters</p>
              <button onClick={resetFilters} className="btn-primary">Clear All Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
                 role="list" aria-label={`${filtered.length} job listings`}>
              {paged.map(job => (
                <div key={job.id ?? job._id} role="listitem">
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          )}
        </main>

        {/* ── Pagination ─────────────────────────────────────────── */}
        {totalPages > 1 && (
          <nav aria-label="Job listing pages" className="flex items-center justify-center gap-2 py-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-forge-blue"
            >
              <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" aria-hidden="true" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push('…')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                typeof p === 'string'
                  ? <span key={`e${i}`} className="text-gray-400 px-1" aria-hidden="true">…</span>
                  : <button key={p} onClick={() => setPage(p)}
                      aria-label={`Page ${p}`}
                      aria-current={page === p ? 'page' : undefined}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-forge-blue ${
                        page === p
                          ? 'bg-forge-blue text-white'
                          : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}>
                      {p}
                    </button>
              )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-forge-blue"
            >
              <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" aria-hidden="true" />
            </button>

            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2" aria-live="polite">
              Page {page} of {totalPages}
            </span>
          </nav>
        )}
      </div>
    </>
  )
}
