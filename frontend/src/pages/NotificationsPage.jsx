import { useStore } from '../store'
import { Bell, CheckCheck, BellOff } from 'lucide-react'
import clsx from 'clsx'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function NotificationsPage() {
  const notifications  = useStore(s => s.notifications)
  const markAllRead    = useStore(s => s.markAllRead)
  const markRead       = useStore(s => s.markRead)
  const unreadCount    = notifications.filter(n => !n.is_read).length

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <BellOff size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              You'll receive notifications here after submitting applications.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map(n => (
              <div
                key={n.notification_id}
                onClick={() => !n.is_read && markRead(n.notification_id)}
                className={clsx(
                  'px-5 py-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                  !n.is_read && 'bg-blue-50/60 dark:bg-blue-900/10'
                )}
              >
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  n.is_read
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : 'bg-blue-100 dark:bg-blue-900/30'
                )}>
                  <Bell size={14} className={n.is_read ? 'text-gray-400' : 'text-forge-blue'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx(
                    'text-sm leading-snug',
                    n.is_read ? 'text-gray-600 dark:text-gray-400' : 'font-medium text-gray-900 dark:text-gray-100'
                  )}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <span className="w-2 h-2 rounded-full bg-forge-blue flex-shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
