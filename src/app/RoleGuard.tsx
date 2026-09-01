import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore.ts'

interface RoleGuardProps {
  children: ReactNode
}

/**
 * Guard theo phien dang nhap that. App nay chi phuc vu Admin nen khong nhan tham so allow
 * nhu ban task-connect-fe (poster/tasker/admin) - chi can kiem tra co session hay khong la
 * du, vi sessionFromTokenResponse() da loc san chi giu lai role 'admin' (xem useAuthStore.ts):
 * tai khoan khong co ADMIN se co session.account.roles rong, van bi coi la "khong hop le" o
 * day va bi day ve /dang-nhap.
 *
 * Chua "hydrated" (AuthBootstrap con dang thu xoay vong phien qua cookie refresh_token) thi
 * khong render gi va khong redirect - tranh nhap nhay ve /dang-nhap roi bat lai vao trang cu
 * khi phien cookie van con hieu luc.
 */
export function RoleGuard({ children }: RoleGuardProps) {
  const hydrated = useAuthStore((state) => state.hydrated)
  const session = useAuthStore((state) => state.session)
  const sessionExpired = useAuthStore((state) => state.sessionExpired)
  const location = useLocation()

  if (!hydrated) return null

  const isAdmin = session !== null && session.account.roles.includes('admin')
  if (!isAdmin) {
    return <Navigate to="/dang-nhap" replace state={{ from: location.pathname, expired: sessionExpired }} />
  }

  return children
}
