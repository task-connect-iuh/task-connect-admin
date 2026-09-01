import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert } from '@ds/components/feedback/Alert'
import { Button } from '@ds/components/core/Button'
import { Field } from '@ds/components/forms/Field'
import { Input } from '@ds/components/forms/Input'
import { AuthLayout } from '../features/auth/AuthLayout.tsx'
import { PasswordInput } from '../features/auth/PasswordInput.tsx'
import { resetPassword } from '../api/auth.ts'
import { ApiError } from '../api/client.ts'
import { submitOnEnter } from '../features/auth/submitOnEnter.ts'

interface ResetLocationState {
  email: string
}

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
const OTP_PATTERN = /^\d{6}$/

/**
 * Buoc cuoi luong quen mat khau - gom ca nhap ma OTP lan mat khau moi trong cung 1 form
 * (khac ban task-connect-fe co man rieng nhap OTP truoc), vi backend xac minh OTP va doi
 * mat khau trong CUNG mot loi goi /auth/reset-password, khong co endpoint xac minh rieng -
 * xem AuthService.resetPassword(). email den tu ForgotPasswordPage qua route state.
 */
export function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as ResetLocationState | null

  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ otp?: string, newPassword?: string, confirm?: string }>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!state?.email) {
    return <Navigate to="/quen-mat-khau" replace />
  }

  const handleSubmit = async () => {
    const nextErrors: typeof errors = {}
    if (!otp.trim()) nextErrors.otp = 'Nhập mã xác minh.'
    else if (!OTP_PATTERN.test(otp.trim())) nextErrors.otp = 'Mã xác minh gồm 6 chữ số.'
    if (!newPassword) nextErrors.newPassword = 'Nhập mật khẩu mới.'
    else if (!PASSWORD_PATTERN.test(newPassword)) nextErrors.newPassword = 'Cần ít nhất 8 ký tự, có chữ hoa, chữ thường và số.'
    if (!confirmPassword) nextErrors.confirm = 'Nhập lại mật khẩu.'
    else if (confirmPassword !== newPassword) nextErrors.confirm = 'Hai mật khẩu chưa khớp nhau.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setFormError('')
    setBusy(true)
    try {
      await resetPassword({
        email: state.email,
        otp: otp.trim(),
        newPassword,
        confirmNewPassword: confirmPassword,
      })
      navigate('/dang-nhap', { state: { justReset: true }, replace: true })
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6" onKeyDown={submitOnEnter(handleSubmit, busy)}>
        <div className="flex flex-col gap-2">
          <h2 className="m-0" style={{ fontSize: 'var(--fs-h1)', lineHeight: 'var(--lh-h1)', fontWeight: 'var(--fw-black)', color: 'var(--text-title)' }}>
            Đặt mật khẩu mới
          </h2>
          <p className="m-0" style={{ color: 'var(--text-muted)' }}>
            Nhập mã 6 chữ số đã gửi tới {state.email} và mật khẩu mới.
          </p>
        </div>

        {formError && <Alert tone="danger" title="Không đặt lại được mật khẩu">{formError}</Alert>}

        <div className="flex flex-col gap-4">
          <Field label="Mã xác minh" error={errors.otp}>
            <Input
              icon="key-round"
              placeholder="Nhập 6 chữ số"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              error={!!errors.otp}
              disabled={busy}
            />
          </Field>

          <PasswordInput
            label="Mật khẩu mới"
            placeholder="Ít nhất 8 ký tự, có chữ hoa, chữ thường và số"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.newPassword}
            disabled={busy}
            show={showPassword}
            onToggleShow={() => setShowPassword((v) => !v)}
          />

          <PasswordInput
            label="Nhập lại mật khẩu"
            placeholder="Nhập lại đúng mật khẩu vừa tạo"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirm}
            disabled={busy}
            show={showPassword}
            onToggleShow={() => setShowPassword((v) => !v)}
          />

          <Button variant="primary" size="lg" block disabled={busy} onClick={handleSubmit}>
            {busy ? 'Đang lưu…' : 'Đặt mật khẩu mới'}
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}
