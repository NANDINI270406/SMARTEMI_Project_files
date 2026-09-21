import { useEffect, useState } from 'react'

const API_BASE_URL = 'http://localhost:5000'

const quickSearches = [
  {
    label: 'Home Loan Subsidy',
    query: 'home loan subsidy schemes',
  },
  {
    label: 'Education Loan',
    query: 'education loan government schemes',
  },
  {
    label: 'MSME Loans',
    query: 'MSME government loan schemes',
  },
  {
    label: 'Subsidy Schemes',
    query: 'government subsidy schemes India',
  },
]

function GovernmentSchemes() {
  const [schemes, setSchemes] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  const fetchSchemes = async (searchQuery = '') => {
    try {
      setError('')

      if (searchQuery) {
        setSearching(true)
      } else {
        setLoading(true)
      }

      const url = searchQuery
        ? `${API_BASE_URL}/api/government-schemes?query=${encodeURIComponent(searchQuery)}`
        : `${API_BASE_URL}/api/government-schemes`

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Unable to fetch government schemes.'
        )
      }

      setSchemes(data.data?.results || [])
    } catch (err) {
      setError(
        err.message ||
          'Unable to load government schemes.'
      )

      setSchemes([])
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  useEffect(() => {
    fetchSchemes()
  }, [])

  const handleSearch = async (event) => {
    event.preventDefault()

    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      await fetchSchemes()
      return
    }

    await fetchSchemes(trimmedQuery)
  }

  const handleQuickSearch = async (searchQuery) => {
    setQuery(searchQuery)
    await fetchSchemes(searchQuery)
  }

  const handleReset = async () => {
    setQuery('')
    await fetchSchemes()
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="text-sm font-semibold text-slate-500">
                SmartEMI Intelligence
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Government Schemes
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Discover current government loan,
                subsidy, and financial assistance
                information through live web search.
              </p>
            </div>

            {/* Tavily Status */}
            <div className="flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                WEB
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Information Source
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <p className="text-sm font-semibold text-slate-700">
                    Live Tavily Search
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-5 sm:p-6">

            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Find a government scheme
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Search by loan type, subsidy,
                business category, or financial need.
              </p>
            </div>

            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="Search loan schemes, subsidies..."
                  disabled={searching}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={
                  searching ||
                  !query.trim()
                }
                className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {searching
                  ? 'Searching...'
                  : 'Search'}
              </button>

              {query && !searching && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset
                </button>
              )}
            </form>

            {/* Quick Searches */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Popular searches
              </p>

              <div className="flex flex-wrap gap-2">
                {quickSearches.map(
                  (item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() =>
                        handleQuickSearch(
                          item.query
                        )
                      }
                      disabled={searching}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {item.label}
                    </button>
                  )
                )}
              </div>
            </div>

          </div>

          {/* Search Information */}
          <div className="flex flex-col gap-2 bg-slate-50 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>
              Results are retrieved from current
              web sources.
            </span>

            <span className="font-medium text-slate-400">
              Powered by Tavily
            </span>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-sm font-bold text-red-700">
                !
              </div>

              <div>
                <p className="text-sm font-bold text-red-800">
                  Unable to load schemes
                </p>

                <p className="mt-1 text-sm leading-5 text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    fetchSchemes(
                      query.trim()
                    )
                  }
                  className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-800 transition hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <>
            <div className="mb-4">
              <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-64 animate-pulse rounded bg-slate-200" />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200" />

                      <div className="flex-1">
                        <div className="h-4 w-3/4 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
                      </div>
                    </div>

                    <div className="mt-5 h-3 w-full rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-full rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-4/5 rounded bg-slate-200" />

                    <div className="mt-5 h-10 w-full rounded-xl bg-slate-200" />
                  </div>
                )
              )}
            </div>
          </>
        )}

        {/* Results */}
        {!loading && schemes.length > 0 && (
          <>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Search Results
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {schemes.length}{' '}
                  web sources found
                  {query.trim()
                    ? ` for "${query.trim()}"`
                    : ''}
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                Live information
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {schemes.map(
                (scheme, index) => (
                  <div
                    key={`${scheme.url}-${index}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >

                    {/* Card Top */}
                    <div className="p-5">

                      <div className="flex items-start gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                          GOV
                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="line-clamp-2 text-base font-bold leading-6 text-slate-900">
                            {scheme.title ||
                              'Government Scheme Information'}
                          </h3>

                          {scheme.url && (
                            <p className="mt-1 truncate text-[11px] text-slate-400">
                              {scheme.url}
                            </p>
                          )}

                        </div>

                      </div>

                      {/* Content */}
                      <div className="mt-5">
                        <p className="line-clamp-5 text-sm leading-6 text-slate-600">
                          {scheme.content ||
                            'No additional information was provided by the source.'}
                        </p>
                      </div>

                    </div>

                    {/* Card Footer */}
                    <div className="mt-auto border-t border-slate-100 bg-slate-50 p-4">

                      <div className="flex items-center justify-between gap-3">

                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          Web Source
                        </span>

                        {typeof scheme.score ===
                          'number' && (
                          <span className="text-[11px] font-medium text-slate-400">
                            Relevance{' '}
                            {Math.round(
                              scheme.score *
                                100
                            )}
                            %
                          </span>
                        )}

                      </div>

                      {scheme.url && (
                        <a
                          href={scheme.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-900 hover:text-white hover:ring-slate-900"
                        >
                          View Source
                          <span>
                            ↗
                          </span>
                        </a>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>

            {/* Verification Notice */}
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-sm">
                  !
                </div>

                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Verify before applying
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    SmartEMI retrieves current information
                    from web sources using Tavily. Eligibility,
                    benefits, documents, deadlines, interest
                    rates, and application requirements can
                    change. Always verify important details
                    on the relevant official government or
                    lender website.
                  </p>
                </div>

              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading &&
          !error &&
          schemes.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                🔎
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                No scheme information found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try a broader search such as home loan,
                education loan, MSME, subsidy, or
                government assistance.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleQuickSearch(
                    'government loan schemes India'
                  )
                }
                className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Search Government Schemes
              </button>

            </div>
          )}

      </div>
    </div>
  )
}

export default GovernmentSchemes