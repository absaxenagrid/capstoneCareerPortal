import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Briefcase, Star, CheckSquare, Bell, Moon, Sun, Bot, Search, Menu, X, ChevronDown, Check, Share2, Settings } from 'lucide-react'
import clsx from 'clsx'
import { useStore } from '../../store'

const NAV_ITEMS = [
  { to: '/career-portal',    label: 'Home',             icon: Briefcase },
  { to: '/jobs',             label: 'Jobs',             icon: Star },
  { to: '/past-applications',label: 'Past Applications',icon: CheckSquare },
  { to: '/notifications',    label: 'Notifications',    icon: Bell },
  { to: '/ai-assistant',     label: 'AI Assistant',     icon: Bot },
  { to: '/referral',         label: 'Referrals',        icon: Share2 },
  { to: '/admin/branding',   label: 'HR Admin',         icon: Settings },
]

export default function Layout() {
  const navigate       = useNavigate()
  const darkMode       = useStore(s => s.darkMode)
  const toggleDarkMode = useStore(s => s.toggleDarkMode)
  const notifications  = useStore(s => s.notifications)
  const markAllRead    = useStore(s => s.markAllRead)
  const [mobileOpen,    setMobileOpen]   = useState(false)
  const [searchText,    setSearchText]   = useState('')
  const [notifOpen,     setNotifOpen]    = useState(false)
  const notifRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.is_read).length

  // Close notification dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchText.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(searchText.trim())}`)
      setSearchText('')
      setMobileOpen(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">

      {/* ── Top Navigation Bar ── */}
      <header className="topbar h-14 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0 border-b border-gray-200 dark:border-gray-800 z-30">

        {/* Logo */}
        <NavLink to="/career-portal" className="text-forge-blue font-bold text-xl tracking-tight flex-shrink-0">
          FORGE
        </NavLink>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 ml-2" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-forge-blue text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <Icon size={14} />
              {label}
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="hidden sm:block relative w-48 lg:w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search roles…"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full pl-8 pr-4 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-forge-blue text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={17} className="text-yellow-400" /> : <Moon size={17} />}
        </button>

        {/* Notification Bell (inline dropdown for desktop) */}
        <div className="relative hidden md:block" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={() => { markAllRead(); setNotifOpen(false) }} className="text-xs text-forge-blue hover:underline flex items-center gap-1">
                    <Check size={11} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No notifications yet.</p>
                ) : notifications.slice(0, 10).map(n => (
                  <div key={n.notification_id} className={clsx(
                    'px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0',
                    !n.is_read && 'bg-blue-50/60 dark:bg-blue-900/10'
                  )}>
                    <p className={clsx('text-sm', !n.is_read ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400')}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => { navigate('/notifications'); setNotifOpen(false) }} className="text-xs text-forge-blue hover:underline">
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* ── Mobile Nav Dropdown ── */}
      {mobileOpen && (
        <div className="md:hidden fixed top-14 inset-x-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg px-4 py-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-forge-blue text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Icon size={16} />{label}
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
          {/* Mobile search */}
          <div className="pt-2 pb-1">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search roles…"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onKeyDown={(e) => { handleSearch(e); setMobileOpen(false) }}
                className="w-full pl-8 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Page Content ── */}
      <main id="main-content" className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
