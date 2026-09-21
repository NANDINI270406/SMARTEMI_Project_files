import { useState } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

const API_BASE_URL = '/api'

function ResetPassword() {
  const navigate = useNavigate()

  const [searchParams] =
    useSearchParams()

  const token =
    searchParams.get('token') || ''

  const [password, setPassword] =
    useState('')

  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!token) {
      setError(
        'Invalid or missing reset link.',
      )
      return
    }

    if (password.length < 8) {
      setError(
        'Password must be at least 8 characters.',
      )
      return
    }

    if (password !== confirmPassword) {
      setError(
        'Passwords do not match.',
      )
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `${API_BASE_URL}/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            token,
            password,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Unable to reset password.',
        )
      }

      setSuccess(
        'Password reset successfully. Redirecting to login...',
      )

      setTimeout(() => {
        navigate('/login', {
          replace: true,
        })
      }, 1500)

    } catch (resetError) {

      setError(
        resetError.message ||
          'Unable to reset password.',
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 py-10">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-3xl font-bold text-white shadow-xl">
            â‚¹
          </div>

          <h1 className="mt-5 text-3xl font-extrabold text-slate-900">
            Smart<span className="text-blue-600">EMI</span>
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            AI Powered Loan Management
          </p>

        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">

          <h2 className="text-2xl font-bold text-slate-900">
            Create New Password
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Choose a new secure password for your SmartEMI account.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                New Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

            </div>

            <div>

              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Confirm New Password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Updating...'
                : 'Reset Password'}
            </button>

          </form>

        </div>

      </div>

    </div>
  )
}

export default ResetPassword

