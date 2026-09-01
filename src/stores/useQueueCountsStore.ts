import { create } from 'zustand'

interface QueueCountsState {
  kycPending: number | null
  certificationPending: number | null
  setKycPending: (count: number) => void
  setCertificationPending: (count: number) => void
}

/**
 * So luong dang cho duyet (KYC/chung chi), dung de hien badge tren AdminShell. Khong tu goi
 * API rieng - moi trang hang doi (KycQueuePage/CertificationQueuePage) tu cap nhat lai sau
 * moi lan fetch cua chinh no (totalElements tu PageResponse that), tranh goi trung API 2 lan
 * (mot lan cho trang, mot lan rieng cho badge).
 */
export const useQueueCountsStore = create<QueueCountsState>((set) => ({
  kycPending: null,
  certificationPending: null,
  setKycPending: (count) => set({ kycPending: count }),
  setCertificationPending: (count) => set({ certificationPending: count }),
}))
