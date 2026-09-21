function EMISummary() {
  const summaryCards = [
    {
      title: 'Active Loans',
      value: '0',
      subtitle: 'No loans added yet',
      icon: '🏦',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      text: 'text-blue-600',
    },
    {
      title: 'Monthly EMI',
      value: '₹0',
      subtitle: 'Monthly commitment',
      icon: '💳',
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      text: 'text-purple-600',
    },
    {
      title: 'EMIs Paid',
      value: '0',
      subtitle: 'Payment history',
      icon: '✓',
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      text: 'text-emerald-600',
    },
    {
      title: 'EMIs Remaining',
      value: '0',
      subtitle: 'Across active loans',
      icon: '📅',
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      text: 'text-orange-600',
    },
  ]

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => (
        <div
          key={card.title}
          className={`rounded-2xl border border-white ${card.bg} p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {card.title}
              </p>

              <h3 className="mt-2 text-3xl font-bold text-slate-900">
                {card.value}
              </h3>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg} text-lg`}
            >
              {card.icon}
            </div>
          </div>

          <p className={`mt-4 text-xs font-medium ${card.text}`}>
            {card.subtitle}
          </p>
        </div>
      ))}
    </div>
  )
}

export default EMISummary