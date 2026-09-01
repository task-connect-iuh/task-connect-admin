import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore.ts'

interface GuestGuardProps {
  children: ReactNode
}

/**
 * Nguoc voi RoleGuard: chan nguoi DA dang nhap khoi cac man chi danh cho khach (Dang nhap,
 * Quen mat khau) - dua ve "/" (Tong quan, khu vuc that su cua Admin da dang nhap trong app
 * nay). Cho qua hydrated truoc de khong redirect nham trong luc con cho ket qua refresh()
 * luc app vua khoi dong - xem RoleGuard.tsx cho ly do tuong tu.
 *
 * Phai kiem tra dung role 'admin', khong chi "co session" - session voi roles rong (tai
 * khoan dang nhap thanh cong nhung khong co ADMIN, xem sessionFromTokenResponse()) van la
 * session != null. Kiem tra session truthy la du se day thang nay ve "/", trong khi
 * RoleGuard o "/" lai day nguoc lai day vi khong phai admin - vong lap redirect vo han
 * (Maximum update depth exceeded o Navigate/RoleGuard).
 *
 * Khong boc /dat-lai-mat-khau: da tu kiem tra route state rieng (email/otp tu man truoc),
 * khong can chan them o day - giong task-connect-fe.
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const hydrated = useAuthStore((state) => state.hydrated)
  const session = useAuthStore((state) => state.session)

  if (!hydrated) return null
  if (session !== null && session.account.roles.includes('admin')) return <Navigate to="/" replace />

  return children
}
