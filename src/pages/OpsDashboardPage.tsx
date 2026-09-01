import { EmptyState } from '@ds/components/feedback/EmptyState'
import { AdminShell } from '../components/AdminShell.tsx'

/**
 * UC19 - dashboard van hanh. Placeholder rong: KPI, tien tam giu, phan bo trang thai thanh
 * toan deu phu thuoc module Task/Booking/Payment/Review chua ton tai (xem
 * docs/PROGRESS-ADMIN-MODULE.md "Ngoai pham vi dot nay"). Cung cach OverviewPage.tsx cua
 * task-connect-fe xu ly vai tro chua co man that.
 */
export function OpsDashboardPage() {
  return (
    <AdminShell navValue="ops" title="Tổng quan vận hành" subtitle="Số liệu nền tảng">
      <EmptyState
        icon="gauge"
        title="Đang xây dựng"
      >
        Dashboard cần dữ liệu từ module Task, Booking, Payment và Review - các module này
        chưa tồn tại. Dùng menu bên trái để vào Hàng đợi KYC, Hàng đợi chứng chỉ, hoặc Quản
        trị viên.
      </EmptyState>
    </AdminShell>
  )
}
