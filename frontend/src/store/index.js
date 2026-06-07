import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function applyTheme(dark) {
  if (dark) document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
}

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Candidate identity ────────────────────────────────────
      candidateId:    1,
      candidateEmail: 'candidate@example.com',
      setCandidateId:    (id)    => set({ candidateId: id }),
      setCandidateEmail: (email) => set({ candidateEmail: email }),

      // ── Dark Mode ─────────────────────────────────────────────
      darkMode: false,
      toggleDarkMode: () => {
        const next = !get().darkMode
        applyTheme(next)
        set({ darkMode: next })
      },
      initTheme: () => { applyTheme(get().darkMode) },

      // ── Notifications ─────────────────────────────────────────
      notifications: [],
      addNotification: (notif) =>
        set(s => ({
          notifications: [
            { notification_id: Date.now(), is_read: false, created_at: new Date().toISOString(), ...notif },
            ...s.notifications,
          ],
        })),
      markAllRead: () =>
        set(s => ({ notifications: s.notifications.map(n => ({ ...n, is_read: true })) })),
      markRead: (id) =>
        set(s => ({ notifications: s.notifications.map(n => n.notification_id === id ? { ...n, is_read: true } : n) })),
      setNotifications: (list) => set({ notifications: list }),

      // ── AI Chat ───────────────────────────────────────────────
      chatOpen: false,
      setChatOpen: (v) => set({ chatOpen: v }),

      // ── Employer Branding (REQ-JP-10) ─────────────────────────
      branding: {
        aboutUs:    'Grid Dynamics is a global technology company specializing in digital transformations for Fortune 1000 companies. We combine deep technical expertise with Agile delivery to help clients modernize their technology stacks and accelerate time to market.',
        mission:    'We exist to empower the world\'s most complex workforces through automated intelligence and cutting-edge generative AI.',
        values: [
          { id: 1, icon: '⚡', title: 'Innovation',   text: 'Shipping 10x faster with our AI orchestration engine.' },
          { id: 2, icon: '🌍', title: 'Diversity',    text: 'A global team from 40+ countries with one shared mission.' },
          { id: 3, icon: '📈', title: 'Growth',       text: 'AI-powered development tracks for every employee.' },
          { id: 4, icon: '🤝', title: 'Integrity',    text: 'Transparent communication and ethical engineering practices.' },
        ],
        benefits: [
          'Competitive salary & equity',
          'Fully remote / hybrid options',
          'Health, dental & vision coverage',
          'Unlimited PTO',
          '$5,000 annual learning budget',
          '401(k) matching up to 6%',
          'Annual tech stipend',
          'Parental leave — 20 weeks',
        ],
        stories: [
          { id: 1, name: 'Priya S.', role: 'Principal Engineer', quote: 'Joining Forge was the best decision of my career. The engineering challenges here are genuinely unsolved problems.', years: 4 },
          { id: 2, name: 'Marcus L.', role: 'ML Research Lead',  quote: 'The culture here is unlike anywhere I\'ve worked — we debate ideas hard, ship fast, and actually celebrate failure.', years: 3 },
          { id: 3, name: 'Aisha K.', role: 'Senior PM',         quote: 'Leadership listens. I came with an idea for a new product and within 6 months we had 50 customers.', years: 2 },
        ],
      },
      setBranding: (patch) => set(s => ({ branding: { ...s.branding, ...patch } })),

      // ── Referral tokens (REQ-JP-11) ───────────────────────────
      // { [token]: { jobId, jobTitle, createdAt, referrerEmail, clicks } }
      referrals: {},
      addReferral: (token, data) =>
        set(s => ({ referrals: { ...s.referrals, [token]: data } })),
      incrementReferralClick: (token) =>
        set(s => ({
          referrals: s.referrals[token]
            ? { ...s.referrals, [token]: { ...s.referrals[token], clicks: (s.referrals[token].clicks || 0) + 1 } }
            : s.referrals
        })),
    }),
    { name: 'forge-store-v3' }
  )
)
