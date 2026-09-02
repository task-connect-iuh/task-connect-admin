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
import { approveCertification, getCertificationHistory, listPendingCertifications, rejectCertification } from '../api/admin.ts'
import type { CertificationReviewDetail, CertificationReviewSummary, CertificationStatus } from '../api/admin.ts'
import { ApiError } from '../api/client.ts'
import { useQueueCountsStore } from '../stores/useQueueCountsStore.ts'

const TABS: { value: CertificationStatus, label: string }[] = [
  { value: 'PENDING_REVIEW', label: 'Đang chờ' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Đã từ chối' },
]

const STATUS_TONE: Record<CertificationStatus, 'warning' | 'success' | 'danger' | 'neutral'> = {
  PENDING_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  EXPIRED: 'neutral',
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN')
}

/**
 * UC04 - hang doi duyet chung chi hanh nghe. Cung khuon voi KycQueuePage.tsx. Khong resolve
 * ten nhom dich vu/loai chung chi (can goi them listServiceCategories/listCertificateTypes
 * roi join phia client) - hien thi thang categoryId/certificateTypeId, chap nhan duoc cho
 * pham vi "toi thieu" cua dot nay, xem docs/PROGRESS-ADMIN-MODULE.md.
 */
export function CertificationQueuePage() {
  const [tab, setTab] = useState<CertificationStatus>('PENDING_REVIEW')
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState<CertificationReviewSummary[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [historyTarget, setHistoryTarget] = useState<CertificationReviewSummary | null>(null)
  const [history, setHistory] = useState<CertificationReviewDetail[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  const [rejectTarget, setRejectTarget] = useState<CertificationReviewSummary | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')

  const [actionBusyId, setActionBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  const load = () => {
    setLoading(true)
    setLoadError('')
    listPendingCertifications({ status: tab, page, size: 20 })
      .then((response) => {
        setRows(response.content)
        setTotalPages(response.totalPages)
        if (tab === 'PENDING_REVIEW') useQueueCountsStore.getState().setCertificationPending(response.totalElements)
      })
      .catch((error) => setLoadError(error instanceof ApiError ? error.message : 'Không tải được hàng đợi. Kiểm tra mạng rồi thử lại.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [tab, page])

  const openHistory = (row: CertificationReviewSummary) => {
    setHistoryTarget(row)
    setHistory([])
    setHistoryError('')
    setHistoryLoading(true)
    getCertificationHistory(row.accountId, row.categoryId)
      .then(setHistory)
      .catch((error) => setHistoryError(error instanceof ApiError ? error.message : 'Không tải được lịch sử nộp chứng chỉ.'))
      .finally(() => setHistoryLoading(false))
  }

  const handleApprove = async (row: CertificationReviewSummary) => {
    setActionError('')
    setActionBusyId(row.id)
    try {
      await approveCertification(row.id)
      load()
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Không duyệt được chứng chỉ. Kiểm tra mạng rồi thử lại.')
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
      await rejectCertification(rejectTarget.id, rejectReason.trim())
      setRejectTarget(null)
      setRejectReason('')
      load()
    } catch (error) {
      setRejectError(error instanceof ApiError ? error.message : 'Không từ chối được chứng chỉ. Kiểm tra mạng rồi thử lại.')
    } finally {
      setActionBusyId(null)
    }
  }

  return (
    <AdminShell navValue="certification" title="Hàng đợi chứng chỉ" subtitle="Xét duyệt chứng chỉ hành nghề của Tasker">
      <div className="flex flex-col gap-4">
        {loadError && <Alert tone="danger" title="Không tải được hàng đợi">{loadError}</Alert>}
        {actionError && <Alert tone="danger" title="Thao tác thất bại">{actionError}</Alert>}

        <Tabs value={tab} onChange={(value) => { setTab(value as CertificationStatus); setPage(0) }} tabs={TABS} />

        <Card padding="0" style={{ overflow: 'hidden' }}>
          {loading
            ? null
            : rows.length === 0
              ? <EmptyState icon="award" title="Không có chứng chỉ nào trong mục này" />
              : (
                  <table>
                    <thead>
                      <tr>
                        <th>Tài khoản</th>
                        <th>Nhóm dịch vụ</th>
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
                          <td>{row.categoryName || row.categoryId}</td>
                          <td className="tc-num">{formatDateTime(row.submittedAt)}</td>
                          <td><Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge></td>
                          <td>
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="secondary" icon="eye" onClick={() => openHistory(row)}>Xem</Button>
                              {row.status === 'PENDING_REVIEW' && (
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

      {historyTarget && (
        <Dialog title="Lịch sử nộp chứng chỉ" subtitle={historyTarget.accountId} onClose={() => setHistoryTarget(null)}>
          {historyLoading && <p>Đang tải…</p>}
          {historyError && <Alert tone="danger" title="Không tải được lịch sử">{historyError}</Alert>}
          <div className="flex flex-col gap-3">
            {history.map((item) => (
              <Card key={item.id} padding="var(--sp-4)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                <div className="flex items-center justify-between">
                  <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
                  <span className="tc-num" style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{formatDateTime(item.submittedAt)}</span>
                </div>
                {item.certificateNumber && <Field label="Số hiệu chứng chỉ"><span className="tc-num">{item.certificateNumber}</span></Field>}
                {item.issuingAuthority && <Field label="Cơ quan cấp"><span>{item.issuingAuthority}</span></Field>}
                <a href={item.fileViewUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-link)', fontWeight: 'var(--fw-bold)' }}>
                  Xem file chứng chỉ
                </a>
                {item.rejectionReason && <Alert tone="danger" title="Lý do từ chối">{item.rejectionReason}</Alert>}
              </Card>
            ))}
          </div>
        </Dialog>
      )}

      {rejectTarget && (
        <Dialog
          title="Từ chối chứng chỉ"
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
