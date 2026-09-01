import { create } from 'zustand'
import type { AccountRole, AccountStatus, TokenResponse } from '../api/auth.ts'

// App nay chi phuc vu Admin - khac task-connect-fe (co poster/tasker/admin), chi co dung
// 1 vai tro hoat dong. RoleGuard chan thang o /dang-nhap neu tai khoan khong co role 'admin'.
export type Role = 'admin'

export interface Session {
  accessToken: string
  account: {
    id: string
    status: AccountStatus
    roles: Role[]
  }
}

interface AuthState {
  session: Session | null
  // true sau khi da thu xoay vong phien qua cookie refresh_token luc app khoi dong
  // (thanh cong hay that bai deu tinh la xong) - dung de RoleGuard khong redirect
  // nham ve /dang-nhap trong luc con dang kiem tra phien cu con hieu luc hay khong.
  hydrated: boolean
  // true khi apiFetch tu dong dang xuat vi access token het han va refresh token
  // (cookie) cung khong con hieu luc - RoleGuard doc co nay de bao cho user biet ly do
  // bi day ve /dang-nhap, thay vi im lang nhu logout thuong.
  sessionExpired: boolean
  setSession: (session: Session | null) => void
  setHydrated: () => void
  logout: () => void
  expireSession: () => void
}

/**
 * Chuyen TokenResponse tu backend thanh Session dung trong store - chi giu lai tai khoan
 * nao THAT SU co role ADMIN trong token, cac role khac (TASK_POSTER/TASKER) bi bo qua vi
 * app nay khong dung toi. Tai khoan khong co ADMIN se co session voi roles rong, RoleGuard
 * tu chan (allow=['admin']) va tra ve /dang-nhap.
 */
export function sessionFromTokenResponse(tokens: TokenResponse): Session {
  const roles: Role[] = tokens.roles.includes('ADMIN' as AccountRole) ? ['admin'] : []
  return {
    accessToken: tokens.accessToken,
    account: {
      id: tokens.accountId,
      status: tokens.status,
      roles,
    },
  }
}

// Phien dang nhap, dung chung nhieu man hinh. Khong luu localStorage (cam theo
// 21-react-frontend.md) - chi giu accessToken trong bo nho. Refresh token song trong cookie
// httpOnly (xem api/auth.ts refresh()), AuthBootstrap goi lai khi app khoi dong.
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  hydrated: false,
  sessionExpired: false,

  setSession: (session) => set({ session, sessionExpired: false }),

  setHydrated: () => set({ hydrated: true }),

  logout: () => set({ session: null, sessionExpired: false }),

  expireSession: () => set({ session: null, sessionExpired: true }),
}))
