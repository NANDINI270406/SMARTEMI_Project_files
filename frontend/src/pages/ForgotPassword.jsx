import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = '/api'

function ForgotPassword() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!email) {
      setError('Please enter your email address.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Unable to process request.',
        )
      }

      setSuccess(
        'If an account exists with this email, a password reset link has been sent.',
      )

    } catch (forgotError) {

      setError(
        forgotError.message ||
          'Something went wrong.',
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
            Forgot Password?
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Enter your registered email and we will send
            you a password reset link.
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
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your registered email"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Sending...'
                : 'Send Reset Link'}
            </button>

          </form>

          <div className="mt-6 text-center">

            <button
              type="button"
              onClick={() =>
                navigate('/login')
              }
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              â† Back to Login
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}

export default ForgotPassword

