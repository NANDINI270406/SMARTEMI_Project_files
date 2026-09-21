import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'


function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: location.state?.registeredEmail || '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)


  const registrationSuccess =
    location.state?.registrationSuccess || false


  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))

    setError('')
  }


  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')

    if (!formData.email || !formData.password) {
      setError(
        'Please enter your email and password.',
      )
      return
    }

    try {
      setLoading(true)

      await login({
        email: formData.email,
        password: formData.password,
      })

      navigate('/dashboard', {
        replace: true,
      })

    } catch (loginError) {
      console.error('LOGIN ERROR:', loginError)

      setError(
        loginError.message ||
          'Unable to login. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }


  const handleGoogleLogin = () => {
    window.location.href =
      '/api/auth/google'
  }


  const handleForgotPassword = () => {
    navigate('/forgot-password')
  }


  const handleCreateAccount = () => {
    navigate('/register')
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 py-10">

      <div className="w-full max-w-md">

        {/* =========================
            LOGO / BRAND
        ========================== */}

        <div className="mb-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-3xl font-bold text-white shadow-xl">
            ₹
          </div>

          <h1 className="mt-5 text-3xl font-extrabold text-slate-900">
            Smart<span className="text-blue-600">EMI</span>
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            AI Powered Loan Management
          </p>

        </div>


        {/* =========================
            LOGIN CARD
        ========================== */}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">

          <div className="mb-7">

            <h2 className="text-2xl font-bold text-slate-900">
              Welcome back
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Login to manage your loans and EMI payments.
            </p>

          </div>


          {/* =========================
              REGISTRATION SUCCESS
          ========================== */}

          {registrationSuccess && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Account created successfully. Please login to continue.
            </div>
          )}


          {/* =========================
              ERROR
          ========================== */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}


          {/* =========================
              LOGIN FORM
          ========================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

            </div>


            {/* PASSWORD */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-blue-600 transition hover:text-purple-600 hover:underline"
                >
                  Forgot Password?
                </button>

              </div>


              <div className="relative">

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-20 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous,
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-blue-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>

              </div>

            </div>


            {/* SIGN IN */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Signing in...'
                : 'Sign In'}
            </button>

          </form>


          {/* =========================
              DIVIDER
          ========================== */}

          <div className="my-6 flex items-center">

            <div className="h-px flex-1 bg-slate-200" />

            <span className="px-4 text-xs font-medium text-slate-400">
              OR
            </span>

            <div className="h-px flex-1 bg-slate-200" />

          </div>


          {/* =========================
              GOOGLE LOGIN
          ========================== */}

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-slate-50 hover:shadow-md"
          >

            {/* Google G */}

            <span className="text-lg font-bold">
              G
            </span>

            Continue with Google

          </button>


          {/* =========================
              CREATE ACCOUNT
          ========================== */}

          <div className="mt-6 text-center">

            <p className="text-sm text-slate-500">
              Don't have an account?
            </p>

            <button
              type="button"
              onClick={handleCreateAccount}
              className="mt-2 font-semibold text-blue-600 transition hover:text-purple-600 hover:underline"
            >
              Create New Account
            </button>

          </div>


          {/* =========================
              SECURITY MESSAGE
          ========================== */}

          <div className="mt-6 rounded-xl bg-blue-50 px-4 py-3 text-center">

            <p className="text-xs text-blue-700">
              Secure authentication powered by SmartEMI backend.
            </p>

          </div>

        </div>


        {/* =========================
            FOOTER
        ========================== */}

        <p className="mt-6 text-center text-xs text-slate-400">
          SmartEMI • AI Powered Loan Management
        </p>

      </div>

    </div>
  )
}


export default Login
