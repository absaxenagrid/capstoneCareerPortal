import { Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/layout/Layout'
import CareerPortalPage      from './pages/CareerPortalPage'
import FeaturedJobsPage      from './pages/FeaturedJobsPage'
import JobDetailPage         from './pages/JobDetailPage'
import ApplicationFormPage   from './pages/ApplicationFormPage'
import PastApplicationsPage  from './pages/PastApplicationsPage'
import NotificationsPage     from './pages/NotificationsPage'
import AIAssistantPage       from './pages/AIAssistantPage'
import BrandingAdminPage     from './pages/BrandingAdminPage'
import ReferralPage          from './pages/ReferralPage'

export default function App() {
  return (
    <HelmetProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/career-portal" replace />} />
          <Route path="career-portal"              element={<CareerPortalPage />} />

          {/* REQ-JP-06: filterable job listing */}
          <Route path="jobs"                       element={<FeaturedJobsPage />} />

          {/* REQ-JP-09: slug-based URLs — new canonical routes */}
          <Route path="careers/:slug"              element={<JobDetailPage />} />
          <Route path="careers/:slug/apply"        element={<ApplicationFormPage />} />

          {/* Legacy numeric-id routes — keep working for existing links */}
          <Route path="jobs/:jobId"                element={<JobDetailPage />} />
          <Route path="jobs/:jobId/apply"          element={<ApplicationFormPage />} />

          <Route path="past-applications"          element={<PastApplicationsPage />} />
          <Route path="notifications"              element={<NotificationsPage />} />
          <Route path="ai-assistant"               element={<AIAssistantPage />} />

          {/* REQ-JP-10: employer branding admin */}
          <Route path="admin/branding"             element={<BrandingAdminPage />} />

          {/* REQ-JP-11: referral link generator */}
          <Route path="referral"                   element={<ReferralPage />} />
          {/* Referral inbound — when ref=token is in URL it's read in ApplicationFormPage */}

          {/* Legacy redirects */}
          <Route path="my-applications"   element={<Navigate to="/past-applications" replace />} />
          <Route path="profile"           element={<Navigate to="/career-portal" replace />} />
        </Route>
      </Routes>
    </HelmetProvider>
  )
}
