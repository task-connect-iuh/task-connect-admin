import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminRolesPage } from '../pages/AdminRolesPage.tsx'
import { CertificationQueuePage } from '../pages/CertificationQueuePage.tsx'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage.tsx'
import { KycQueuePage } from '../pages/KycQueuePage.tsx'
import { LoginPage } from '../pages/LoginPage.tsx'
import { NotFoundPage } from '../pages/NotFoundPage.tsx'
import { OpsDashboardPage } from '../pages/OpsDashboardPage.tsx'
import { ResetPasswordPage } from '../pages/ResetPasswordPage.tsx'
import { AuthBootstrap } from './AuthBootstrap.tsx'
import { GuestGuard } from './GuestGuard.tsx'
import { RoleGuard } from './RoleGuard.tsx'

function App() {
  return (
    // useTransitions={false}: cung ly do voi task-connect-fe (xem App.tsx ben do) - react-router
    // v7 mac dinh boc moi cap nhat location trong React.startTransition, pha vo gia dinh dong bo
    // cua cac lenh navigate() ngay sau setSession() trong LoginPage.tsx.
    <BrowserRouter useTransitions={false}>
      <AuthBootstrap />
      <Routes>
        <Route
          path="/"
          element={(
            <RoleGuard>
              <OpsDashboardPage />
            </RoleGuard>
          )}
        />
        <Route
          path="/hang-doi-kyc"
          element={(
            <RoleGuard>
              <KycQueuePage />
            </RoleGuard>
          )}
        />
        <Route
          path="/hang-doi-chung-chi"
          element={(
            <RoleGuard>
              <CertificationQueuePage />
            </RoleGuard>
          )}
        />
        <Route
          path="/quan-tri-vien"
          element={(
            <RoleGuard>
              <AdminRolesPage />
            </RoleGuard>
          )}
        />
        <Route path="/dang-nhap" element={<GuestGuard><LoginPage /></GuestGuard>} />
        <Route path="/quen-mat-khau" element={<GuestGuard><ForgotPasswordPage /></GuestGuard>} />
        <Route path="/dat-lai-mat-khau" element={<ResetPasswordPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
