import { useEffect, useState } from 'react'
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import {
  getUnreadNotificationCount,
} from '../services/notificationService'

function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)

  const [profileOpen, setProfileOpen] =
    useState(false)

  const [searchOpen, setSearchOpen] =
    useState(false)

  const [searchText, setSearchText] =
    useState('')

  const [
    unreadNotificationCount,
    setUnreadNotificationCount,
  ] = useState(0)

  // =========================
  // FETCH NOTIFICATION COUNT
  // =========================

  const fetchUnreadNotificationCount =
    async () => {
      try {
        const response =
          await getUnreadNotificationCount()

        const count =
          response?.data?.unread_count || 0

        setUnreadNotificationCount(count)
      } catch (error) {
        console.error(
          'Unable to fetch notification count:',
          error,
        )

        setUnreadNotificationCount(0)
      }
    }

  // =========================
  // INITIAL + AUTO REFRESH
  // =========================

  useEffect(() => {
    fetchUnreadNotificationCount()

    const intervalId = setInterval(() => {
      fetchUnreadNotificationCount()
    }, 30000)

    const handleWindowFocus = () => {
      fetchUnreadNotificationCount()
    }

    window.addEventListener(
      'focus',
      handleWindowFocus,
    )

    return () => {
      clearInterval(intervalId)

      window.removeEventListener(
        'focus',
        handleWindowFocus,
      )
    }
  }, [])

  // =========================
  // CLOSE MENUS ON ROUTE CHANGE
  // =========================

  useEffect(() => {
    setMobileMenuOpen(false)
    setProfileOpen(false)
    setSearchOpen(false)
    setSearchText('')
  }, [location.pathname])

  // =========================
  // NAVIGATION ITEMS
  // =========================

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: '⌂',
      description: 'Overview & insights',
    },
    {
      label: 'My Loans',
      path: '/my-loans',
      icon: '▣',
      description: 'Manage your loans',
    },
    {
      label: 'EMI Calculator',
      path: '/emi-calculator',
      icon: '₹',
      description: 'Calculate your EMI',
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: '▤',
      description: 'Financial reports',
    },
    {
      label: 'AI Assistant',
      path: '/ai-assistant',
      icon: '✦',
      description: 'Smart financial help',
    },
    {
      label: 'Government Schemes',
      path: '/government-schemes',
      icon: '◈',
      description: 'Current schemes',
    },
    {
      label: 'Prepayment',
      path: '/prepayment',
      icon: '↗',
      description: 'Plan loan prepayment',
    },
    {
      label: 'Loan Comparison',
      path: '/loan-comparison',
      icon: '⇄',
      description: 'Compare loan options',
    },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: '🔔',
      description: 'Alerts & reminders',
    },
  ]

  // =========================
  // SEARCH ITEMS
  // =========================

  const searchItems = navigationItems.map(
    ({ label, path, description }) => ({
      label,
      path,
      description,
    }),
  )

  const filteredSearchItems =
    searchText.trim()
      ? searchItems.filter((item) =>
          `${item.label} ${item.description}`
            .toLowerCase()
            .includes(
              searchText.toLowerCase(),
            ),
        )
      : searchItems

  // =========================
  // USER HELPERS
  // =========================

  const displayName =
    user?.full_name || 'SmartEMI User'

  const userInitial =
    displayName.charAt(0).toUpperCase()

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      await logout()

      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      console.error(
        'Logout failed:',
        error,
      )
    }
  }

  // =========================
  // NAVIGATION
  // =========================

  const handleNavigation = (path) => {
    navigate(path)

    setMobileMenuOpen(false)
    setSearchOpen(false)
    setSearchText('')
    setProfileOpen(false)
  }

  const handleSearchNavigation = (path) => {
    handleNavigation(path)
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================
          DESKTOP SIDEBAR
      ================================== */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">

        {/* Brand */}

        <div className="flex h-20 items-center border-b border-slate-100 px-5">

          <button
            type="button"
            onClick={() =>
              navigate('/dashboard')
            }
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50"
          >

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-sm">
              ₹
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
                Smart
                <span className="text-blue-600">
                  EMI
                </span>
              </h1>

              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Loan Management
              </p>
            </div>

          </button>

        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Workspace
          </p>

          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-blue-50 font-semibold text-blue-700'
                    : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >

              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
                  )}

                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm transition ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700'
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="min-w-0 flex-1 truncate">
                    {item.label}
                  </span>

                  {item.path ===
                    '/notifications' &&
                    unreadNotificationCount > 0 && (
                      <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unreadNotificationCount >
                        99
                          ? '99+'
                          : unreadNotificationCount}
                      </span>
                    )}
                </>
              )}

            </NavLink>
          ))}

        </nav>

        {/* User / Logout */}

        <div className="border-t border-slate-100 p-4">

          <div className="mb-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
                {userInitial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {displayName}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {user?.email || ''}
                </p>
              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
              ↪
            </span>

            Logout
          </button>

        </div>

      </aside>

      {/* =================================
          MOBILE OVERLAY
      ================================== */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}

      {/* =================================
          MOBILE SIDEBAR
      ================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >

        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">

          <button
            type="button"
            onClick={() =>
              handleNavigation('/dashboard')
            }
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white">
              ₹
            </div>

            <div className="text-left">
              <h1 className="text-lg font-extrabold text-slate-900">
                Smart
                <span className="text-blue-600">
                  EMI
                </span>
              </h1>

              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Loan Management
              </p>
            </div>

          </button>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close menu"
          >
            ×
          </button>

        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Workspace
          </p>

          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  isActive
                    ? 'bg-blue-50 font-semibold text-blue-700'
                    : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >

              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1">
                    {item.label}
                  </span>

                  {item.path ===
                    '/notifications' &&
                    unreadNotificationCount > 0 && (
                      <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unreadNotificationCount >
                        99
                          ? '99+'
                          : unreadNotificationCount}
                      </span>
                    )}
                </>
              )}

            </NavLink>
          ))}

        </nav>

        <div className="border-t border-slate-100 p-4">

          <div className="mb-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
                {userInitial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {displayName}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {user?.email || ''}
                </p>
              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
              ↪
            </span>

            Logout
          </button>

        </div>

      </aside>

      {/* =================================
          MAIN APPLICATION
      ================================== */}

      <div className="lg:pl-64">

        {/* =================================
            TOP HEADER
        ================================== */}

        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">

          <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-8">

            {/* Left */}

            <div className="flex min-w-0 items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
                aria-label="Open menu"
              >
                ☰
              </button>

              <div className="hidden min-w-0 sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  SmartEMI
                </p>

                <p className="truncate text-sm font-semibold text-slate-700">
                  Financial Management
                </p>
              </div>

            </div>

            {/* Right */}

            <div className="flex items-center gap-2">

              {/* Search */}

              <button
                type="button"
                onClick={() =>
                  setSearchOpen(
                    (previous) =>
                      !previous,
                  )
                }
                className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition ${
                  searchOpen
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
                aria-label="Search"
                aria-expanded={searchOpen}
              >
                ⌕
              </button>

              {/* Notifications */}

              <button
                type="button"
                onClick={() =>
                  navigate('/notifications')
                }
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl border text-base transition ${
                  location.pathname ===
                  '/notifications'
                    ? 'border-indigo-200 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                } text-slate-600`}
                aria-label="Notifications"
              >
                🔔

                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {unreadNotificationCount >
                    99
                      ? '99+'
                      : unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Profile */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen(
                      (previous) =>
                        !previous,
                    )
                  }
                  className={`flex items-center gap-2 rounded-xl p-1.5 transition ${
                    profileOpen
                      ? 'bg-slate-100'
                      : 'hover:bg-slate-50'
                  }`}
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                >

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-sm">
                    {userInitial}
                  </div>

                  <span className="hidden max-w-32 truncate text-sm font-semibold text-slate-700 md:block">
                    {displayName}
                  </span>

                  <span className="hidden text-xs text-slate-400 md:block">
                    ▾
                  </span>

                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                    <div className="bg-slate-50 px-4 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                          {userInitial}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">
                            {displayName}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {user?.email || ''}
                          </p>
                        </div>

                      </div>

                    </div>

                    <div className="p-2">

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false)

                          alert(
                            'Profile settings will be available in a future phase.',
                          )
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                          ◉
                        </span>

                        <span>
                          <span className="block">
                            Profile
                          </span>

                          <span className="block text-xs font-normal text-slate-400">
                            View account information
                          </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false)

                          alert(
                            'Application settings will be available in a future phase.',
                          )
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                          ⚙
                        </span>

                        <span>
                          <span className="block">
                            Settings
                          </span>

                          <span className="block text-xs font-normal text-slate-400">
                            Application preferences
                          </span>
                        </span>
                      </button>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                          ↪
                        </span>

                        Logout
                      </button>

                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* =================================
              SEARCH PANEL
          ================================== */}

          {searchOpen && (
            <div className="border-t border-slate-100 bg-white px-4 py-4 md:px-8">

              <div className="mx-auto max-w-3xl">

                <div className="relative">

                  <input
                    type="text"
                    value={searchText}
                    onChange={(event) =>
                      setSearchText(
                        event.target.value,
                      )
                    }
                    autoFocus
                    placeholder="Search SmartEMI..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                    ⌕
                  </span>

                </div>

                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">

                  <div className="max-h-80 overflow-y-auto">

                    {filteredSearchItems.length >
                    0 ? (
                      filteredSearchItems.map(
                        (item) => (
                          <button
                            key={item.path}
                            type="button"
                            onClick={() =>
                              handleSearchNavigation(
                                item.path,
                              )
                            }
                            className="flex w-full items-center justify-between gap-4 border-b border-slate-50 px-4 py-3.5 text-left transition last:border-0 hover:bg-slate-50"
                          >

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {item.label}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-slate-400">
                                {item.description}
                              </p>
                            </div>

                            <span className="shrink-0 text-xs font-medium text-indigo-500">
                              Open →
                            </span>

                          </button>
                        ),
                      )
                    ) : (
                      <div className="px-4 py-8 text-center">

                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                          ⌕
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          No matching section
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Try searching for another SmartEMI feature.
                        </p>

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>
          )}

        </header>

        {/* =================================
            PAGE CONTENT
        ================================== */}

        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>

      </div>

    </div>
  )
}

export default DashboardLayout