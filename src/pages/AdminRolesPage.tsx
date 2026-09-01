import { useState } from 'react'
import { Alert } from '@ds/components/feedback/Alert'
import { Button } from '@ds/components/core/Button'
import { Card } from '@ds/components/core/Card'
import { Field } from '@ds/components/forms/Field'
import { Input } from '@ds/components/forms/Input'
import { AdminShell } from '../components/AdminShell.tsx'
import { grantAdminRole, revokeAdminRole } from '../api/auth.ts'
import { ApiError } from '../api/client.ts'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

/**
 * Gan/thu hoi quyen Admin - khong co man tham chieu san trong Design System, tu dung theo
 * Field/Input/Button da dung o cac trang khac. Backend tu kiem tra "chi super-admin duoc
 * goi" (AuthService.requireSuperAdmin()) - trang nay khong biet truoc ai la super-admin, chi
 * hien loi ro rang tu ApiError.message neu tai khoan dang dang nhap khong phai super-admin.
 */
export function AdminRolesPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [busyAction, setBusyAction] = useState<'grant' | 'revoke' | null>(null)

  const validate = () => {
    if (!email.trim()) {
      setEmailError('Nhập email tài khoản.')
      return false
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError('Email chưa đúng định dạng.')
      return false
    }
    setEmailError('')
    return true
  }

  const runAction = async (action: 'grant' | 'revoke') => {
    setFormError('')
    setSuccessMessage('')
    if (!validate()) return

    setBusyAction(action)
    try {
      if (action === 'grant') {
        await grantAdminRole({ email: email.trim() })
        setSuccessMessage(`Đã gán quyền Admin cho ${email.trim()}.`)
      } else {
        await revokeAdminRole({ email: email.trim() })
        setSuccessMessage(`Đã thu hồi quyền Admin của ${email.trim()}.`)
      }
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.')
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <AdminShell navValue="admins" title="Quản trị viên" subtitle="Gán hoặc thu hồi quyền Admin cho một tài khoản">
      <Card padding="var(--sp-6)" style={{ maxWidth: 'var(--content-max)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        {successMessage && <Alert tone="success" title={successMessage} />}
        {formError && <Alert tone="danger" title="Thao tác thất bại">{formError}</Alert>}

        <Field label="Email tài khoản" error={emailError} hint="Tài khoản phải đã tồn tại (đã đăng ký qua ứng dụng chính).">
          <Input
            icon="at-sign"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            disabled={busyAction !== null}
          />
        </Field>

        <div className="flex gap-3">
          <Button variant="primary" icon="user-plus" disabled={busyAction !== null} onClick={() => runAction('grant')}>
            {busyAction === 'grant' ? 'Đang gán…' : 'Gán quyền Admin'}
          </Button>
          <Button variant="danger" icon="user-minus" disabled={busyAction !== null} onClick={() => runAction('revoke')}>
            {busyAction === 'revoke' ? 'Đang thu hồi…' : 'Thu hồi quyền Admin'}
          </Button>
        </div>

        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', margin: 0 }}>
          Chỉ super-admin (tài khoản seed ban đầu) mới thao tác được ở đây. Không thể thu hồi
          quyền của chính super-admin.
        </p>
      </Card>
    </AdminShell>
  )
}
