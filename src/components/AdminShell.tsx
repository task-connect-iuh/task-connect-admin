import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoInverse from '@ds/assets/logo-lockup-inverse.svg'
import { Avatar } from '@ds/components/core/Avatar'
import { Icon } from '@ds/components/core/Icon'
import { IconButton } from '@ds/components/core/IconButton'
import { logout as logoutRequest } from '../api/auth.ts'
import { useAuthStore } from '../stores/useAuthStore.ts'
import { useQueueCountsStore } from '../stores/useQueueCountsStore.ts'

interface NavItem {
  value: string
  label: string
  icon: string
  to: string
  badge?: number | null
}

interface AdminShellProps {
  navValue: string
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

/**
 * Khung ung dung Admin: sidebar teal dam co dinh 268px thay cho thanh tren, chuyen the tu
 * @ds/ui_kits/admin/AdminShell.jsx sang component TS that (cung cach AppShell.tsx cua
 * task-connect-fe chuyen the shared/WebShell.jsx - file goc dung bien global window.*, khong
 * phai module ES that, khong import thang duoc). Badge so luong doc tu
 * useQueueCountsStore (cap nhat that tu totalElements cua PageResponse), khong phai so gia
 * nhu ban demo goc.
 */
export function AdminShell({ navValue, title, subtitle, actions, children }: AdminShellProps) {
  const navigate = useNavigate()
  const kycPending = useQueueCountsStore((state) => state.kycPending)
  const certificationPending = useQueueCountsStore((state) => state.certificationPending)

  const nav: NavItem[] = [
    { value: 'ops', label: 'Tổng quan', icon: 'gauge', to: '/' },
    { value: 'kyc', label: 'Hàng đợi KYC', icon: 'shield-check', to: '/hang-doi-kyc', badge: kycPending },
    { value: 'certification', label: 'Hàng đợi chứng chỉ', icon: 'award', to: '/hang-doi-chung-chi', badge: certificationPending },
    { value: 'admins', label: 'Quản trị viên', icon: 'user-cog', to: '/quan-tri-vien' },
  ]

  const handleLogout = async () => {
    try {
      await logoutRequest()
    } catch {
      // Dang xuat la thao tac don phia client - loi mang o day khong ngan nguoi dung thoat.
    }
    useAuthStore.getState().logout()
    navigate('/dang-nhap', { replace: true })
  }

  return (
    // 268px: khong phai gia tri tuy tien, khop dung @ds/ui_kits/admin/AdminShell.jsx va
    // duoc chinh 20-design-system.md ghi ro "Admin dung sidebar co dinh 268px" - khong co
    // token spacing nao thay the duoc vi day la kich thuoc cau truc rieng cua khung Admin,
    // check-design-tokens.mjs bao warning o day la ky vong dung, khong phai loi bo sot.
    <div style={{ display: 'grid', gridTemplateColumns: '268px 1fr', minHeight: '100vh' }}>
      <aside style={{ background: 'var(--brand-deep)', padding: 'var(--sp-5) var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
        <img src={logoInverse} alt="TaskConnect Admin" style={{ width: 200 }} />
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {nav.map((item) => {
            const active = item.value === navValue
            return (
              <Link
                key={item.value}
                to={item.to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', minHeight: 46, padding: '0 var(--sp-4)',
                  borderRadius: 'var(--r-md)', border: `var(--bw) solid ${active ? 'var(--teal-600)' : 'transparent'}`,
                  background: active ? 'var(--teal-800)' : 'transparent', color: active ? 'var(--on-deep)' : 'var(--on-deep-muted)',
                  fontSize: 'var(--fs-body)', fontWeight: active ? 'var(--fw-bold)' : 'var(--fw-medium)', textAlign: 'left',
                }}
              >
                <Icon name={item.icon} size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {!!item.badge && (
                  // padding bat doi xung (1px doc, 8px ngang) khop dung badge trong
                  // AdminShell.jsx goc, khong co token spacing nao khop chinh xac cap gia
                  // tri nay - warning cua check-design-tokens.mjs o day la ky vong dung.
                  <span
                    className="tc-num"
                    style={{
                      padding: '1px 8px', borderRadius: 'var(--r-pill)', background: 'var(--brand-tint-strong)',
                      color: 'var(--teal-700)', fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-black)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', paddingTop: 'var(--sp-4)', borderTop: 'var(--bw) solid var(--teal-700)' }}>
          <Avatar name="Admin" size={38} />
          <div style={{ color: 'var(--on-deep-muted)', fontSize: 'var(--fs-sm)', flex: 1 }}>
            <div style={{ fontWeight: 'var(--fw-bold)', color: 'var(--on-deep)' }}>Quản trị viên</div>
          </div>
          <IconButton icon="log-out" label="Đăng xuất" size="sm" style={{ color: 'var(--on-deep-muted)' }} onClick={handleLogout} />
        </div>
      </aside>
      <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-5) var(--gutter-desktop)', borderBottom: 'var(--bw) solid var(--border)', background: 'var(--surface-card)' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 'var(--fs-h2)' }}>{title}</h1>
            {subtitle && <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</p>}
          </div>
          {actions}
        </header>
        <div style={{ padding: 'var(--gutter-desktop)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>{children}</div>
      </main>
    </div>
  )
}
