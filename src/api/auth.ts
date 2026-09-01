import { apiFetch } from './client.ts'

// Khop dung enum that cua backend, xem vn.taskconnect.auth.api.AccountRole/AccountStatus.
// App nay chi phuc vu Admin, nhung tai khoan van co the mang ca 3 role (vd mot Tasker duoc
// cap them quyen Admin) - RoleGuard tu loc, khong can rut gon enum o day.
export type AccountRole = 'TASK_POSTER' | 'TASKER' | 'ADMIN'
export type AccountStatus = 'UNVERIFIED' | 'ACTIVE' | 'LOCKED' | 'SUSPENDED'

/** Khop TokenResponse that - refreshToken khong nam trong body (JsonIgnore, chi qua cookie httpOnly). */
export interface TokenResponse {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
  accountId: string
  status: AccountStatus
  roles: AccountRole[]
}

export interface LoginPayload {
  email: string
  password: string
}

// Khong co register()/verifyEmail()/resendVerification() - app Admin khong tu dang ky tai
// khoan, chi dang nhap bang tai khoan da duoc seed (V10__seed_admin_account.sql) hoac duoc
// super-admin gan quyen qua grantAdminRole(), xem docs/PROGRESS-ADMIN-MODULE.md.

export function login(payload: LoginPayload) {
  return apiFetch<TokenResponse>('/auth/login', { method: 'POST', body: payload })
}

/** Xoay vong phien bang refresh token trong cookie httpOnly - khong can body. */
export function refresh() {
  return apiFetch<TokenResponse>('/auth/refresh', { method: 'POST' })
}

export function logout() {
  return apiFetch<void>('/auth/logout', { method: 'POST' })
}

export function forgotPassword(payload: { email: string }) {
  return apiFetch<{ retryAfterSeconds: number }>('/auth/forgot-password', { method: 'POST', body: payload })
}

export function resetPassword(payload: { email: string, otp: string, newPassword: string, confirmNewPassword: string }) {
  return apiFetch<void>('/auth/reset-password', { method: 'POST', body: payload })
}

/** Doi mat khau khi da dang nhap (can access token) - khac resetPassword, khong dung OTP. Thanh cong se thu hoi phien hien tai (refresh token cookie), FE phai tu logout/dieu huong ve dang nhap. */
export function changePassword(payload: { currentPassword: string, newPassword: string, confirmNewPassword: string }) {
  return apiFetch<void>('/auth/change-password', { method: 'POST', body: payload })
}

/** Chi super-admin goi duoc (BE tu kiem tra, FE khong can biet truoc ai la super-admin). */
export function grantAdminRole(payload: { email: string }) {
  return apiFetch<void>('/auth/admins/grant', { method: 'POST', body: payload })
}

/** Chi super-admin goi duoc, va khong the thu hoi quyen cua chinh super-admin. */
export function revokeAdminRole(payload: { email: string }) {
  return apiFetch<void>('/auth/admins/revoke', { method: 'POST', body: payload })
}
