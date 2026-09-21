import { useState } from 'react'

import { askAIAssistant } from '../services/aiAssistantService'

const suggestions = [
  {
    label: 'Current home loan rates',
    question:
      'What are the current home loan interest rates in India?',
  },
  {
    label: 'Government loan schemes',
    question:
      'What government loan schemes are currently available in India?',
  },
  {
    label: 'Interest rate factors',
    question:
      'What factors affect home loan interest rates?',
  },
  {
    label: 'EMI guidance',
    question:
      'How can I reduce my monthly EMI burden?',
  },
]

function SourceCard({ result }) {
  return (
    <a
      href={result.url}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
          ↗
        </div>

        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-slate-900">
            {result.title || 'Web source'}
          </p>

          {result.content && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
              {result.content}
            </p>
          )}

          <p className="mt-2 truncate text-[11px] text-slate-400">
            {result.url}
          </p>
        </div>
      </div>
    </a>
  )
}

function AIAssistant() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedQuestion =
      question.trim()

    if (!trimmedQuestion || loading) {
      return
    }

    setError('')
    setLoading(true)

    const userMessage = {
      type: 'user',
      text: trimmedQuestion,
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ])

    setQuestion('')

    try {
      const response =
        await askAIAssistant(
          trimmedQuestion,
        )

      const assistantData =
        response.data

      const assistantMessage = {
        type: 'assistant',
        text:
          assistantData.message ||
          'I could not generate a response.',
        sourceType:
          assistantData.source_type,
        results:
          assistantData.web_results ||
          [],
      }

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ])
    } catch (err) {
      setError(
        err.message ||
          'Unable to get a response.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestion = (text) => {
    setQuestion(text)
    setError('')
  }

  const clearChat = () => {
    setMessages([])
    setQuestion('')
    setError('')
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="text-sm font-semibold text-slate-500">
                SmartEMI Intelligence
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                AI EMI Assistant
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Ask questions about loans, EMIs,
                interest rates, government schemes,
                and current financial information.
              </p>
            </div>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearChat}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Clear Conversation
              </button>
            )}

          </div>
        </div>

        {/* AI Status */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              AI
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                SmartEMI Assistant
              </p>

              <p className="text-xs text-slate-500">
                Powered by SmartEMI + Tavily web search
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-semibold text-slate-600">
              Ready
            </span>
          </div>
        </div>

        {/* Main Assistant */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Welcome */}
          {messages.length === 0 && (
            <div className="border-b border-slate-100 p-5 sm:p-7">
              <div className="rounded-2xl bg-slate-900 p-6 text-white">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-bold">
                    AI
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Financial Assistant
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      How can I help you?
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                      Ask about EMI calculations,
                      loan concepts, current rates,
                      government schemes, or other
                      loan-related questions.
                    </p>
                  </div>

                </div>

                {/* Suggestions */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {suggestions.map(
                    (suggestion) => (
                      <button
                        key={
                          suggestion.label
                        }
                        type="button"
                        onClick={() =>
                          handleSuggestion(
                            suggestion.question,
                          )
                        }
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/10"
                      >
                        <p className="text-sm font-semibold text-white">
                          {
                            suggestion.label
                          }
                        </p>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                          {
                            suggestion.question
                          }
                        </p>
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chat */}
          {messages.length > 0 && (
            <div className="max-h-[600px] space-y-6 overflow-y-auto p-5 sm:p-7">

              {messages.map(
                (message, index) => {
                  const isUser =
                    message.type ===
                    'user'

                  return (
                    <div
                      key={index}
                      className={`flex ${
                        isUser
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`flex max-w-[92%] gap-3 sm:max-w-[85%] ${
                          isUser
                            ? 'flex-row-reverse'
                            : ''
                        }`}
                      >

                        {/* Avatar */}
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                            isUser
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-slate-900 text-white'
                          }`}
                        >
                          {isUser
                            ? 'You'
                            : 'AI'}
                        </div>

                        {/* Message */}
                        <div
                          className={`rounded-2xl p-4 ${
                            isUser
                              ? 'rounded-tr-md bg-slate-900 text-white'
                              : 'rounded-tl-md bg-slate-100 text-slate-800'
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-6">
                            {message.text}
                          </p>

                          {/* Source Type */}
                          {!isUser &&
                            message.sourceType && (
                              <div className="mt-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      message.sourceType ===
                                      'web'
                                        ? 'bg-blue-500'
                                        : 'bg-emerald-500'
                                    }`}
                                  />

                                  {message.sourceType ===
                                  'web'
                                    ? 'Current web information'
                                    : 'SmartEMI data'}
                                </span>
                              </div>
                            )}

                          {/* Sources */}
                          {!isUser &&
                            message.sourceType ===
                              'web' &&
                            message.results?.length >
                              0 && (
                              <div className="mt-4 border-t border-slate-200 pt-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                    Web Sources
                                  </p>

                                  <span className="text-[11px] text-slate-400">
                                    {
                                      message
                                        .results
                                        .length
                                    }{' '}
                                    sources
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  {message.results.map(
                                    (
                                      result,
                                      resultIndex,
                                    ) => (
                                      <SourceCard
                                        key={
                                          resultIndex
                                        }
                                        result={
                                          result
                                        }
                                      />
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                        </div>
                      </div>
                    </div>
                  )
                },
              )}

              {/* Loading */}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[85%] gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                      AI
                    </div>

                    <div className="rounded-2xl rounded-tl-md bg-slate-100 px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                          style={{
                            animationDelay:
                              '150ms',
                          }}
                        />
                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                          style={{
                            animationDelay:
                              '300ms',
                          }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        Checking relevant information...
                      </p>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mx-5 mb-4 rounded-xl border border-red-200 bg-red-50 p-4 sm:mx-7">
              <div className="flex items-start gap-3 text-sm text-red-700">
                <span className="font-bold">
                  !
                </span>

                <div>
                  <p className="font-semibold">
                    Assistant request failed
                  </p>

                  <p className="mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-100 bg-slate-50 p-4 sm:p-5"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={question}
                  onChange={(event) =>
                    setQuestion(
                      event.target.value,
                    )
                  }
                  placeholder="Ask about loans, EMIs, interest rates..."
                  disabled={loading}
                  maxLength={1000}
                  className="min-w-0 flex-1 rounded-xl bg-white px-3 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:bg-slate-50"
                />

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !question.trim()
                  }
                  className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading
                    ? 'Searching...'
                    : 'Ask Assistant'}
                </button>
              </div>

              <div className="mt-2 flex flex-col gap-1 px-3 pb-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-slate-400">
                  Current web-based questions use
                  Tavily search.
                </p>

                <p className="text-[11px] text-slate-400">
                  {question.length}/1000
                </p>
              </div>

            </div>
          </form>

        </div>

        {/* Disclaimer */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500 shadow-sm">
          <span className="font-semibold text-slate-700">
            SmartEMI AI note:
          </span>{' '}
          Web results are retrieved through Tavily
          and may change over time. Always verify
          important financial information with the
          relevant bank, lender, or official
          government source before making financial
          decisions.
        </div>

      </div>
    </div>
  )
}

export default AIAssistant
