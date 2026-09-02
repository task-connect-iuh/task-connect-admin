import { apiFetch } from './client.ts'

// Khop dung enum that cua backend, xem vn.taskconnect.user.api.{KycStatus,CertificationStatus}.
export type KycStatus = 'NOT_SUBMITTED' | 'VERIFYING' | 'VERIFIED' | 'REJECTED'
export type CertificationStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED'

/** Khop PageResponse<T> that cua backend (common/response/PageResponse.java). */
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// ---------------------------------------------------------------------------
// KYC - xem KycVerificationController.java (chi ROLE_ADMIN cho 4 ham duoi day).
// ---------------------------------------------------------------------------

export interface KycReviewSummary {
  id: string
  accountId: string
  fullNameOnId: string
  // Ten that/avatar cua tai khoan (tu user_profiles) - khac fullNameOnId (chuoi go tay tren
  // CCCD). Co the null neu tai khoan (hiem) chua tung tao ho so.
  accountFullName: string | null
  avatarUrl: string | null
  status: KycStatus
  submittedAt: string
}

export interface KycReviewDetail {
  id: string
  accountId: string
  fullNameOnId: string
  idNumber: string
  idCardFrontViewUrl: string
  idCardBackViewUrl: string
  status: KycStatus
  submittedAt: string
  reviewedAt: string | null
  rejectionReason: string | null
}

/** Hang doi duyet KYC - mac dinh chi lay dang VERIFYING (dang cho duyet). */
export function listPendingKyc(params: { status?: KycStatus, page?: number, size?: number } = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.size !== undefined) query.set('size', String(params.size))
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiFetch<PageResponse<KycReviewSummary>>(`/users/kyc-verifications${suffix}`)
}

/** Chi tiet day du (so CCCD da giai ma, URL xem anh ky ngan han) - dung accountId cua dong trong hang doi. */
export function getKycDetail(accountId: string) {
  return apiFetch<KycReviewDetail>(`/users/${accountId}/kyc-verifications/latest`)
}

export function approveKyc(kycVerificationId: string) {
  return apiFetch<void>(`/users/kyc-verifications/${kycVerificationId}/approve`, { method: 'PATCH' })
}

export function rejectKyc(kycVerificationId: string, rejectionReason: string) {
  return apiFetch<void>(`/users/kyc-verifications/${kycVerificationId}/reject`, {
    method: 'PATCH',
    body: { rejectionReason },
  })
}

// ---------------------------------------------------------------------------
// Chung chi hanh nghe - xem TaskerSkillController.java (chi ROLE_ADMIN cho 4 ham duoi day).
// ---------------------------------------------------------------------------

export interface CertificationReviewSummary {
  id: string
  accountId: string
  // Ten that/avatar cua tai khoan (tu user_profiles) - co the null neu tai khoan (hiem) chua
  // tung tao ho so.
  accountFullName: string | null
  avatarUrl: string | null
  categoryId: string
  // Ten nhom dich vu (tu user_service_categories) - co the null neu danh muc bi xoa sau khi
  // da nop (hiem).
  categoryName: string | null
  certificateTypeId: string
  status: CertificationStatus
  submittedAt: string
}

export interface CertificationReviewDetail {
  id: string
  certificateTypeId: string
  certificateNumber: string | null
  issuingAuthority: string | null
  issuedDate: string | null
  expiryDate: string | null
  fileViewUrl: string
  experienceProofUrl: string | null
  claimedExperienceYears: number | null
  status: CertificationStatus
  rejectionReason: string | null
  submittedAt: string
  reviewedAt: string | null
}

/** Hang doi duyet chung chi - mac dinh chi lay dang PENDING_REVIEW. */
export function listPendingCertifications(params: { status?: CertificationStatus, page?: number, size?: number } = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.size !== undefined) query.set('size', String(params.size))
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiFetch<PageResponse<CertificationReviewSummary>>(`/users/tasker-certifications${suffix}`)
}

/** Toan bo lich su nop chung chi cua 1 cap tai khoan+category - dung accountId/categoryId cua dong trong hang doi. */
export function getCertificationHistory(accountId: string, categoryId: string) {
  return apiFetch<CertificationReviewDetail[]>(`/users/${accountId}/tasker-skills/${categoryId}/certifications`)
}

export function approveCertification(certificationId: string) {
  return apiFetch<void>(`/users/tasker-certifications/${certificationId}/approve`, { method: 'PATCH' })
}

export function rejectCertification(certificationId: string, rejectionReason: string) {
  return apiFetch<void>(`/users/tasker-certifications/${certificationId}/reject`, {
    method: 'PATCH',
    body: { rejectionReason },
  })
}
