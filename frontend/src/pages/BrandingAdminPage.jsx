import { useState, useId } from 'react'
import { Helmet } from 'react-helmet-async'
import { useStore } from '../store'
import { Lock, Unlock, Plus, Trash2, Save, Eye, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const ADMIN_PIN = '1234'  // In production this would be backend auth

const L = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide'
const I = 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-forge-blue text-gray-900 dark:text-gray-100 placeholder-gray-400'

export default function BrandingAdminPage() {
  const branding    = useStore(s => s.branding)
  const setBranding = useStore(s => s.setBranding)
  const pinId       = useId()

  const [authed,  setAuthed]  = useState(false)
  const [pin,     setPin]     = useState('')
  const [pinErr,  setPinErr]  = useState('')
  const [saved,   setSaved]   = useState(false)

  // Local editable copy
  const [form, setForm] = useState(branding)

  const handlePin = (e) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) { setAuthed(true); setPinErr('') }
    else { setPinErr('Incorrect PIN. Please try again.') }
  }

  const updateValue  = (k, v)         => setForm(f => ({ ...f, [k]: v }))
  const updateValue_ = (k, i, field, v) => setForm(f => {
    const arr = [...f[k]]; arr[i] = { ...arr[i], [field]: v }; return { ...f, [k]: arr }
  })
  const addItem = (k, blank) => setForm(f => ({ ...f, [k]: [...f[k], { ...blank, id: Date.now() }] }))
  const removeItem = (k, i)  => setForm(f => ({ ...f, [k]: f[k].filter((_, idx) => idx !== i) }))

  const save = () => {
    setBranding(form)
    setSaved(true)
    toast.success('Branding saved successfully!')
    setTimeout(() => setSaved(false), 3000)
  }

  // ── PIN Gate ─────────────────────────────────────────────────
  if (!authed) return (
    <>
      <Helmet>
        <title>Admin — Employer Branding | Forge Careers</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="card p-8 w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-forge-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-forge-blue" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">HR Admin Area</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your admin PIN to manage employer branding</p>
          <form onSubmit={handlePin} noValidate>
            <label htmlFor={pinId} className="sr-only">Admin PIN</label>
            <input
              id={pinId}
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="Enter PIN"
              value={pin}
              onChange={e => { setPin(e.target.value); setPinErr('') }}
              aria-describedby={pinErr ? 'pin-error' : undefined}
              aria-invalid={!!pinErr}
              className={`${I} text-center text-lg tracking-widest mb-2`}
              autoComplete="current-password"
            />
            {pinErr && <p id="pin-error" role="alert" className="text-xs text-red-500 mb-3">{pinErr}</p>}
            <button type="submit" className="btn-primary w-full mt-2">
              <Unlock size={14} className="inline mr-1.5" aria-hidden="true" /> Unlock
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-4">Default PIN: <code>1234</code></p>
          <Link to="/career-portal" className="block mt-3 text-xs text-forge-blue hover:underline">← Back to Portal</Link>
        </div>
      </div>
    </>
  )

  // ── Admin Editor ─────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>Branding Admin — Forge Careers</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/career-portal" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-forge-blue rounded">
                <ArrowLeft size={16} aria-hidden="true"/>
              </Link>
              <span className="text-xs font-bold text-forge-blue uppercase tracking-widest">HR Admin</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Employer Branding</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Changes are saved locally and shown immediately on the careers portal.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/career-portal" target="_blank"
              className="btn-secondary text-sm flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-forge-blue"
              aria-label="Preview careers portal (opens in new tab)">
              <Eye size={14} aria-hidden="true"/> Preview
            </Link>
            <button onClick={save}
              className="btn-primary text-sm flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-forge-blue"
              aria-label="Save all branding changes">
              <Save size={14} aria-hidden="true"/> {saved ? 'Saved ✓' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="space-y-6">

          {/* About Us */}
          <section className="card p-5" aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">About Us</h2>
            <div className="space-y-4">
              <div>
                <label className={L} htmlFor="mission-field">Mission Statement</label>
                <textarea
                  id="mission-field"
                  rows={2}
                  value={form.mission}
                  onChange={e => updateValue('mission', e.target.value)}
                  className={I}
                  placeholder="We exist to…"
                />
              </div>
              <div>
                <label className={L} htmlFor="about-field">About Us paragraph</label>
                <textarea
                  id="about-field"
                  rows={4}
                  value={form.aboutUs}
                  onChange={e => updateValue('aboutUs', e.target.value)}
                  className={I}
                  placeholder="Grid Dynamics is…"
                />
              </div>
            </div>
          </section>

          {/* Culture Values */}
          <section className="card p-5" aria-labelledby="values-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="values-heading" className="text-base font-bold text-gray-900 dark:text-gray-100">Culture Values</h2>
              <button
                onClick={() => addItem('values', { icon:'⭐', title:'', text:'' })}
                className="btn-secondary text-xs flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-forge-blue"
                aria-label="Add culture value"
              >
                <Plus size={12} aria-hidden="true"/> Add Value
              </button>
            </div>
            <div className="space-y-3">
              {form.values.map((v, i) => (
                <div key={v.id ?? i} className="flex gap-3 items-start bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className={L} htmlFor={`val-icon-${i}`}>Icon (emoji)</label>
                      <input id={`val-icon-${i}`} className={I} value={v.icon} onChange={e => updateValue_('values',i,'icon',e.target.value)} placeholder="⭐" maxLength={2}/>
                    </div>
                    <div>
                      <label className={L} htmlFor={`val-title-${i}`}>Title</label>
                      <input id={`val-title-${i}`} className={I} value={v.title} onChange={e => updateValue_('values',i,'title',e.target.value)} placeholder="Innovation"/>
                    </div>
                    <div>
                      <label className={L} htmlFor={`val-text-${i}`}>Description</label>
                      <input id={`val-text-${i}`} className={I} value={v.text} onChange={e => updateValue_('values',i,'text',e.target.value)} placeholder="We ship fast…"/>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem('values', i)}
                    className="text-red-400 hover:text-red-600 p-1 mt-5 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label={`Remove ${v.title || 'value'}`}
                  >
                    <Trash2 size={14} aria-hidden="true"/>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section className="card p-5" aria-labelledby="benefits-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="benefits-heading" className="text-base font-bold text-gray-900 dark:text-gray-100">Benefits &amp; Perks</h2>
              <button
                onClick={() => setForm(f => ({ ...f, benefits: [...f.benefits, ''] }))}
                className="btn-secondary text-xs flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-forge-blue"
                aria-label="Add benefit"
              >
                <Plus size={12} aria-hidden="true"/> Add Benefit
              </button>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {form.benefits.map((b, i) => (
                <li key={i} className="flex gap-2 items-center">
                  <label className="sr-only" htmlFor={`benefit-${i}`}>Benefit {i+1}</label>
                  <input
                    id={`benefit-${i}`}
                    className={`${I} flex-1`}
                    value={b}
                    onChange={e => {
                      const arr = [...form.benefits]; arr[i] = e.target.value
                      setForm(f => ({ ...f, benefits: arr }))
                    }}
                    placeholder="e.g. Unlimited PTO"
                  />
                  <button
                    onClick={() => setForm(f => ({ ...f, benefits: f.benefits.filter((_,idx) => idx!==i) }))}
                    className="text-red-400 hover:text-red-600 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label={`Remove benefit ${i+1}`}
                  >
                    <Trash2 size={13} aria-hidden="true"/>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Employee Stories */}
          <section className="card p-5" aria-labelledby="stories-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="stories-heading" className="text-base font-bold text-gray-900 dark:text-gray-100">Employee Story Cards</h2>
              <button
                onClick={() => addItem('stories', { name:'', role:'', quote:'', years:1 })}
                className="btn-secondary text-xs flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-forge-blue"
                aria-label="Add employee story"
              >
                <Plus size={12} aria-hidden="true"/> Add Story
              </button>
            </div>
            <div className="space-y-4">
              {form.stories.map((s, i) => (
                <div key={s.id ?? i} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className={L} htmlFor={`story-name-${i}`}>Full Name</label>
                      <input id={`story-name-${i}`} className={I} value={s.name} onChange={e => updateValue_('stories',i,'name',e.target.value)} placeholder="Jane Doe"/>
                    </div>
                    <div>
                      <label className={L} htmlFor={`story-role-${i}`}>Role</label>
                      <input id={`story-role-${i}`} className={I} value={s.role} onChange={e => updateValue_('stories',i,'role',e.target.value)} placeholder="Senior Engineer"/>
                    </div>
                    <div>
                      <label className={L} htmlFor={`story-years-${i}`}>Years at Company</label>
                      <input id={`story-years-${i}`} type="number" min="0" className={I} value={s.years} onChange={e => updateValue_('stories',i,'years',e.target.value)} placeholder="3"/>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <label className={L} htmlFor={`story-quote-${i}`}>Quote</label>
                      <textarea id={`story-quote-${i}`} rows={2} className={I} value={s.quote} onChange={e => updateValue_('stories',i,'quote',e.target.value)} placeholder="Joining Forge was…"/>
                    </div>
                    <button
                      onClick={() => removeItem('stories', i)}
                      className="text-red-400 hover:text-red-600 p-1 mt-5 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label={`Remove ${s.name || 'story'}`}
                    >
                      <Trash2 size={14} aria-hidden="true"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sticky save footer */}
        <div className="mt-8 flex justify-end gap-3 py-4 border-t border-gray-200 dark:border-gray-800">
          <Link to="/career-portal" className="btn-secondary text-sm focus:outline-none focus:ring-2 focus:ring-forge-blue">Cancel</Link>
          <button onClick={save} className="btn-primary text-sm flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-forge-blue">
            <Save size={14} aria-hidden="true"/> {saved ? 'Saved ✓' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  )
}
