import { useState } from 'react'

const quickQuestions = [
  'How many EMIs are remaining?',
  'When is my next EMI?',
  'How much interest have I paid?',
  'Can I reduce my EMI burden?',
]

function AIAssistant() {
  const [input, setInput] = useState('')

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content:
        "Hi! I'm your SmartEMI Assistant. I can help you understand your loans, EMIs, payment history, calculations and financial information.",
    },
  ])

  const handleSend = () => {
    const trimmedInput = input.trim()

    if (!trimmedInput) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmedInput,
    }

    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content:
        "I've received your question. Once your SmartEMI account and backend are connected, I'll use your actual loan and payment data to answer this.",
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
      assistantMessage,
    ])

    setInput('')
  }

  const handleQuickQuestion = (question) => {
    setInput(question)
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      {/* Assistant Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl">
            🤖
          </div>

          <div>
            <h2 className="font-bold">SmartEMI AI Assistant</h2>

            <div className="mt-1 flex items-center gap-2 text-xs text-blue-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Smart financial assistant
            </div>
          </div>
        </div>

        <span className="hidden rounded-full bg-white/15 px-3 py-1 text-xs sm:block">
          AI Powered
        </span>
      </div>

      {/* Chat Area */}
      <div className="min-h-[360px] space-y-5 bg-slate-50 p-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-6 ${
                message.role === 'user'
                  ? 'rounded-br-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Questions */}
      <div className="border-t border-slate-200 bg-white px-6 pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Quick questions
        </p>

        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question) => (
            <button
              key={question}
              onClick={() => handleQuickQuestion(question)}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white p-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSend()
              }
            }}
            placeholder="Ask about your EMI, loan or payment history..."
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />

          <button
            onClick={handleSend}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl"
          >
            Send
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-slate-400">
          SmartEMI uses your account data, calculations and verified current
          information when available.
        </p>
      </div>
    </section>
  )
}

export default AIAssistanthaa abb AggregateError
