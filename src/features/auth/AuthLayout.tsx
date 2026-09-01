import type { ReactNode } from 'react'
import logoInverse from '@ds/assets/logo-lockup-inverse.svg'
import { Icon } from '@ds/components/core/Icon'

interface AuthLayoutProps {
  children: ReactNode
}

const FEATURES = [
  { icon: 'shield-check', title: 'Xét duyệt KYC và chứng chỉ', body: 'Xác minh danh tính và chứng chỉ hành nghề của Tasker.' },
  { icon: 'user-cog', title: 'Cấp quyền quản trị', body: 'Chỉ super-admin mới gán hoặc thu hồi được quyền Admin.' },
]

/**
 * Khung hai cot dung chung cho man Auth cua app Admin - rut gon tu ban task-connect-fe
 * (bo nhanh 'signup' vi app nay khong tu dang ky tai khoan, chi 1 bien the 'login').
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-stretch bg-paper">
      <aside
        className="w-full md:w-1/2 flex flex-col justify-between gap-8 p-8 md:p-10"
        style={{ background: 'var(--brand-deep)', color: 'var(--on-deep)', borderRadius: '0 var(--r-xl) var(--r-xl) 0' }}
      >
        <img src={logoInverse} alt="TaskConnect" className="w-auto self-start" style={{ height: 104 }} />

        <div className="flex flex-col gap-5 max-w-content">
          <h1 className="m-0" style={{ fontSize: 'var(--fs-h1)', lineHeight: 'var(--lh-h1)', fontWeight: 'var(--fw-black)', color: 'var(--white)' }}>
            Khu vực quản trị TaskConnect.
          </h1>
          <p className="m-0" style={{ color: 'var(--on-deep-muted)' }}>
            Chỉ dành cho tài khoản có quyền Admin đã được cấp sẵn hoặc gán bởi super-admin.
          </p>
          <div className="flex flex-col gap-4 mt-1">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex gap-4 items-start">
                <span
                  className="flex-none flex items-center justify-center"
                  style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', border: 'var(--bw) solid var(--teal-700)', color: 'var(--teal-200)' }}
                >
                  <Icon name={feature.icon} size={18} />
                </span>
                <div className="flex flex-col gap-0.5">
                  <strong style={{ color: 'var(--white)' }}>{feature.title}</strong>
                  <span style={{ color: 'var(--on-deep-muted)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-sm)' }}>{feature.body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-5" style={{ borderTop: 'var(--bw) solid var(--teal-700)', fontSize: 'var(--fs-sm)', color: 'var(--on-deep-muted)' }}>
          <span>TaskConnect Admin</span>
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-content flex flex-col gap-5">
          {children}
        </div>
      </main>
    </div>
  )
}
