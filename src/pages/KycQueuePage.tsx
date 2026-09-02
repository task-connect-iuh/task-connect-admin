import { useEffect, useState } from 'react'
import { Alert } from '@ds/components/feedback/Alert'
import { Avatar } from '@ds/components/core/Avatar'
import { Badge } from '@ds/components/core/Badge'
import { Button } from '@ds/components/core/Button'
import { Card } from '@ds/components/core/Card'
import { Dialog } from '@ds/components/feedback/Dialog'
import { EmptyState } from '@ds/components/feedback/EmptyState'
import { Field } from '@ds/components/forms/Field'
import { Tabs } from '@ds/components/navigation/Tabs'
import { Textarea } from '@ds/components/forms/Textarea'
import { AdminShell } from '../components/AdminShell.tsx'
import { approveKyc, getKycDetail, listPendingKyc, rejectKyc } from '../api/admin.ts'
import type { KycReviewDetail, KycReviewSummary, KycStatus } from '../api/admin.ts'
import { ApiError } from '../api/client.ts'
import { useQueueCountsStore } from '../stores/useQueueCountsStore.ts'

const TABS: { value: KycStatus, label: string }[] = [
  { value: 'VERIFYING', label: 'Đang chờ' },
  { value: 'VERIFIED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Đã từ chối' },
]

const STATUS_TONE: Record<KycStatus, 'warning' | 'success' | 'danger' | 'neutral'> = {
  NOT_SUBMITTED: 'neutral',
  VERIFYING: 'warning',
  VERIFIED: 'success',
  REJECTED: 'danger',
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN')
}

/**
 * UC05 - hang doi duyet KYC. Bam bo cuc @ds/ui_kits/admin/KycQueue.jsx nhung bo tab "Co
 * canh bao"/chip loc "Trung CCCD" (du lieu flag khong co that o backend, chi la mock trong
 * file thiet ke goc) - chi giu 3 tab theo dung KycStatus that: Dang cho/Da duyet/Da tu choi,
 * chuyen thang qua tham so status cua GET /users/kyc-verifications.
 */
export function KycQueuePage() {
  const [tab, setTab] = useState<KycStatus>('VERIFYING')
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState<KycReviewSummary[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [detail, setDetail] = useState<KycReviewDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  const [rejectTarget, setRejectTarget] = useState<KycReviewSummary | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')

  const [actionBusyId, setActionBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  const load = () => {
    setLoading(true)
    setLoadError('')
    listPendingKyc({ status: tab, page, size: 20 })
      .then((response) => {
        setRows(response.content)
        setTotalPages(response.totalPages)
        if (tab === 'VERIFYING') useQueueCountsStore.getState().setKycPending(response.totalElements)
      })
      .catch((error) => setLoadError(error instanceof ApiError ? error.message : 'Không tải được hàng đợi. Kiểm tra mạng rồi thử lại.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [tab, page])

  const openDetail = (row: KycReviewSummary) => {
    setDetail(null)
    setDetailError('')
    setDetailLoading(true)
    getKycDetail(row.accountId)
      .then(setDetail)
      .catch((error) => setDetailError(error instanceof ApiError ? error.message : 'Không tải được chi tiết hồ sơ.'))
      .finally(() => setDetailLoading(false))
  }

  const handleApprove = async (row: KycReviewSummary) => {
    setActionError('')
    setActionBusyId(row.id)
    try {
      await approveKyc(row.id)
      load()
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Không duyệt được hồ sơ. Kiểm tra mạng rồi thử lại.')
    } finally {
      setActionBusyId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    if (!rejectReason.trim()) {
      setRejectError('Nhập lý do từ chối.')
      return
    }
    setRejectError('')
    setActionBusyId(rejectTarget.id)
    try {
      await rejectKyc(rejectTarget.id, rejectReason.trim())
      setRejectTarget(null)
      setRejectReason('')
      load()
    } catch (error) {
      setRejectError(error instanceof ApiError ? error.message : 'Không từ chối được hồ sơ. Kiểm tra mạng rồi thử lại.')
    } finally {
      setActionBusyId(null)
    }
  }

  return (
    <AdminShell navValue="kyc" title="Hàng đợi KYC" subtitle="Xét duyệt hồ sơ xác minh danh tính của Tasker">
      <div className="flex flex-col gap-4">
        {loadError && <Alert tone="danger" title="Không tải được hàng đợi">{loadError}</Alert>}
        {actionError && <Alert tone="danger" title="Thao tác thất bại">{actionError}</Alert>}

        <Tabs value={tab} onChange={(value) => { setTab(value as KycStatus); setPage(0) }} tabs={TABS} />

        <Card padding="0" style={{ overflow: 'hidden' }}>
          {loading
            ? null
            : rows.length === 0
              ? <EmptyState icon="shield-check" title="Không có hồ sơ nào trong mục này" />
              : (
                  <table>
                    <thead>
                      <tr>
                        <th>Người gửi</th>
                        <th>Ngày nộp</th>
                        <th>Trạng thái</th>
                        <th style={{ textAlign: 'right' }}>Quyết định</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <Avatar name={row.accountFullName || 'Tài khoản'} src={row.avatarUrl ?? undefined} size={36} />
                              <div>
                                <strong>{row.accountFullName || 'Chưa đặt tên'}</strong>
                                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>{row.accountId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="tc-num">{formatDateTime(row.submittedAt)}</td>
                          <td><Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge></td>
                          <td>
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="secondary" icon="eye" onClick={() => openDetail(row)}>Xem</Button>
                              {row.status === 'VERIFYING' && (
                                <>
                                  <Button size="sm" icon="check" disabled={actionBusyId === row.id} onClick={() => handleApprove(row)}>Duyệt</Button>
                                  <Button size="sm" variant="danger" icon="x" disabled={actionBusyId === row.id} onClick={() => { setRejectTarget(row); setRejectReason(''); setRejectError('') }}>Từ chối</Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
        </Card>

        {totalPages > 1 && (
          <div className="flex gap-2 items-center justify-center">
            <Button size="sm" variant="ghost" icon="chevron-left" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Trang trước</Button>
            <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>Trang {page + 1} / {totalPages}</span>
            <Button size="sm" variant="ghost" icon="chevron-right" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Trang sau</Button>
          </div>
        )}
      </div>

      {(detailLoading || detail || detailError) && (
        <Dialog title="Chi tiết hồ sơ KYC" onClose={() => { setDetail(null); setDetailError('') }}>
          {detailLoading && <p>Đang tải…</p>}
          {detailError && <Alert tone="danger" title="Không tải được chi tiết">{detailError}</Alert>}
          {detail && (
            <div className="flex flex-col gap-3">
              <Field label="Họ tên trên CCCD"><strong>{detail.fullNameOnId}</strong></Field>
              <Field label="Số CCCD"><span className="tc-num">{detail.idNumber}</span></Field>
              <div className="flex gap-3">
                <a href={detail.idCardFrontViewUrl} target="_blank" rel="noreferrer">
                  <img src={detail.idCardFrontViewUrl} alt="Mặt trước CCCD" style={{ width: 200, borderRadius: 'var(--r-md)', border: 'var(--bw) solid var(--border)' }} />
                </a>
                <a href={detail.idCardBackViewUrl} target="_blank" rel="noreferrer">
                  <img src={detail.idCardBackViewUrl} alt="Mặt sau CCCD" style={{ width: 200, borderRadius: 'var(--r-md)', border: 'var(--bw) solid var(--border)' }} />
                </a>
              </div>
              {detail.rejectionReason && <Alert tone="danger" title="Lý do từ chối lần gần nhất">{detail.rejectionReason}</Alert>}
            </div>
          )}
        </Dialog>
      )}

      {rejectTarget && (
        <Dialog
          title={`Từ chối hồ sơ của ${rejectTarget.fullNameOnId}`}
          subtitle="Lý do sẽ được gửi cho người dùng, nguyên văn"
          onClose={() => setRejectTarget(null)}
          footer={(
            <>
              <Button variant="secondary" style={{ flex: 1 }} onClick={() => setRejectTarget(null)}>Huỷ</Button>
              <Button variant="danger" style={{ flex: 1 }} disabled={actionBusyId === rejectTarget.id} onClick={handleReject}>Gửi từ chối</Button>
            </>
          )}
        >
          <Field label="Lý do" error={rejectError} hint="Người dùng phải hiểu cần làm gì tiếp theo.">
            <Textarea rows={4} maxLength={500} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </Field>
        </Dialog>
      )}
    </AdminShell>
  )
}
