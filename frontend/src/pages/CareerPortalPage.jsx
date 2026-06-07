import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '../store'
import { jobApi } from '../services/api'
import JobCard from '../components/jobs/JobCard'
import { Search, Zap, Users, TrendingUp, ArrowRight, Heart, Star } from 'lucide-react'

export default function CareerPortalPage() {
  const navigate   = useNavigate()
  const branding   = useStore(s => s.branding)
  const [searchText, setSearchText] = useState('')

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn:  () => jobApi.getAll().then(r => r.data),
  })

  const featuredJobs = jobs.slice(0, 6)

  const handleSearch = (e) => {
    if ((e.type === 'click' || e.key === 'Enter') && searchText.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(searchText.trim())}`)
    }
  }

  return (
    <>
      <Helmet>
        <title>Forge Careers — Join Grid Dynamics</title>
        <meta name="description" content="Explore open engineering, product, and design roles at Grid Dynamics. Remote, hybrid, and onsite opportunities worldwide." />
      </Helmet>

      {/* Skip link — WCAG 2.4.1 */}
      <a href="#main-content"
         className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-forge-blue focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold">
        Skip to main content
      </a>

      <div className="min-h-full">
        {/* ── Hero ─────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20" aria-hidden="true" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%,#1d4ed8 0%,transparent 60%),radial-gradient(circle at 80% 50%,#0f172a 0%,transparent 60%)'
          }} />
          <div className="relative px-6 sm:px-10 py-12 sm:py-16">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Candidate Portal</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Build the Future with Grid Dynamics</h1>
            <p className="text-blue-200 text-sm sm:text-base max-w-xl mb-8 leading-relaxed">
              {branding.mission}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/jobs" className="btn-primary px-6 py-2.5 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900">
                Explore Jobs
              </Link>
              <Link to="/admin/branding"
                    className="px-6 py-2.5 text-sm border border-white/30 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900">
                HR Admin
              </Link>
            </div>
          </div>
        </div>

        {/* ── Search ───────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 sm:px-10 py-5">
          <div role="search" className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <label htmlFor="hero-search" className="sr-only">Search roles by keyword</label>
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                id="hero-search"
                type="search"
                placeholder="Search by role, skill, or keyword…"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onKeyDown={handleSearch}
                className="input-field pl-9"
              />
            </div>
            <button onClick={handleSearch} className="btn-primary px-6">Search</button>
          </div>
        </div>

        <main id="main-content" className="px-6 sm:px-10 py-8">

          {/* ── REQ-JP-06/10: Culture Section ────────────────── */}
          <section aria-labelledby="culture-heading" className="mb-10">
            <p className="text-xs font-bold text-forge-blue uppercase tracking-widest mb-1">Our DNA</p>
            <h2 id="culture-heading" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">The Forge Culture</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Mission card */}
              <div className="sm:col-span-2 relative rounded-xl overflow-hidden h-48 sm:h-52 bg-slate-800 flex items-end">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true" />
                <div className="relative p-5 text-white">
                  <h3 className="font-bold text-lg">Our Mission</h3>
                  <p className="text-sm text-gray-300 mt-1">{branding.mission}</p>
                </div>
              </div>
              {/* Values cards */}
              {branding.values.slice(0,4).map((v, i) => (
                <div key={v.id ?? i} className={`rounded-xl p-5 text-white ${
                  i === 0 ? 'bg-blue-500' :
                  i === 1 ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 [&_p]:text-gray-500 dark:[&_p]:text-gray-400' :
                  i === 2 ? 'sm:col-span-2 bg-blue-400' :
                  'bg-indigo-600'
                }`}>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-xl" aria-hidden="true">
                    {v.icon}
                  </div>
                  <h3 className="font-bold text-lg">{v.title}</h3>
                  <p className="text-sm mt-1 opacity-90">{v.text}</p>
                </div>
              ))}
            </div>

            {/* About Us */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">About Grid Dynamics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{branding.aboutUs}</p>
            </div>

            {/* Benefits */}
            {branding.benefits.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Heart size={16} className="text-forge-blue" aria-hidden="true" /> Benefits &amp; Perks
                </h3>
                <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {branding.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                      <span className="text-green-500 font-bold" aria-hidden="true">✓</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Employee stories */}
            {branding.stories.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Star size={16} className="text-forge-blue" aria-hidden="true" /> Employee Stories
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {branding.stories.map(s => (
                    <figure key={s.id} className="card p-5">
                      <blockquote className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed mb-3">
                        "{s.quote}"
                      </blockquote>
                      <figcaption className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {s.name}
                        <span className="block text-gray-500 dark:text-gray-400 font-normal">{s.role} · {s.years}y</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── Featured Jobs ─────────────────────────────────── */}
          <section aria-labelledby="featured-jobs-heading" className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-bold text-forge-blue uppercase tracking-widest mb-1">Open Positions</p>
                <h2 id="featured-jobs-heading" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Featured Opportunities
                </h2>
              </div>
              <Link to="/jobs" className="text-forge-blue text-sm font-semibold hover:underline flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-forge-blue rounded">
                View all <ArrowRight size={14} aria-hidden="true"/>
              </Link>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Loading jobs">
                {[1,2,3].map(i => <div key={i} className="card h-48 animate-pulse bg-gray-100 dark:bg-gray-800" aria-hidden="true"/>)}
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredJobs.map(job => (
                  <li key={job.id ?? job._id}>
                    <JobCard job={job}/>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── CTA ──────────────────────────────────────────── */}
          <section aria-labelledby="cta-heading" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 sm:p-10 text-center">
            <h2 id="cta-heading" className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Don't see your fit?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Join our talent community for new opening alerts.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <label htmlFor="community-email" className="sr-only">Your email address</label>
              <input id="community-email" type="email" placeholder="Enter your email" className="input-field sm:w-64"/>
              <button className="btn-primary px-6">Join Community</button>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
