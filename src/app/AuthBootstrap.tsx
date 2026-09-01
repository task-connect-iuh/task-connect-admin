import { useEffect, useRef } from 'react'
import { refresh } from '../api/auth.ts'
import { sessionFromTokenResponse, useAuthStore } from '../stores/useAuthStore.ts'

/**
 * Chay dung mot lan luc app khoi dong: thu xoay vong phien bang cookie httpOnly
 * refresh_token (con hieu luc thi backend phat access token moi). Day la cach duy nhat
 * de Session song qua lan F5, vi accessToken chi nam trong bo nho Zustand (cam
 * localStorage cho du lieu nghiep vu, xem 21-react-frontend.md). Khong co cookie hop le
 * (chua tung dang nhap, cookie het han) la tinh huong binh thuong, khong phai loi.
 *
 * Dung ref-guard (startedRef) thay vi AbortController - xem giai thich day du o
 * task-connect-fe/src/app/AuthBootstrap.tsx (cung root cause: StrictMode mount-cleanup-mount
 * dong bo, round-trip localhost qua nhanh de abort() kip chan request that di).
 */
export function AuthBootstrap() {
  const setSession = useAuthStore((state) => state.setSession)
  const setHydrated = useAuthStore((state) => state.setHydrated)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    refresh()
      .then((tokens) => {
        setSession(sessionFromTokenResponse(tokens))
      })
      .catch(() => {
        // Khong co phien cu hop le - giu session null, khong bao loi cho nguoi dung.
      })
      .finally(() => {
        setHydrated()
      })
  }, [setSession, setHydrated])

  return null
}
