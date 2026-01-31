import { differenceInDays, parseISO, format } from 'date-fns'

export default function WarrantyBadge({ expiryDate, showDate = false }) {
  if (!expiryDate) return null

  const today = new Date()
  const expiry = parseISO(expiryDate)
  const daysRemaining = differenceInDays(expiry, today)

  let status, bgColor, textColor, label

  if (daysRemaining < 0) {
    status = 'expired'
    bgColor = 'bg-gray-100 dark:bg-gray-700'
    textColor = 'text-gray-600 dark:text-gray-400'
    label = 'Expired'
  } else if (daysRemaining <= 30) {
    status = 'critical'
    bgColor = 'bg-red-100 dark:bg-red-900/30'
    textColor = 'text-red-700 dark:text-red-400'
    label = `${daysRemaining}d left`
  } else if (daysRemaining <= 60) {
    status = 'warning'
    bgColor = 'bg-yellow-100 dark:bg-yellow-900/30'
    textColor = 'text-yellow-700 dark:text-yellow-400'
    label = `${daysRemaining}d left`
  } else if (daysRemaining <= 90) {
    status = 'upcoming'
    bgColor = 'bg-blue-100 dark:bg-blue-900/30'
    textColor = 'text-blue-700 dark:text-blue-400'
    label = `${daysRemaining}d left`
  } else {
    status = 'active'
    bgColor = 'bg-green-100 dark:bg-green-900/30'
    textColor = 'text-green-700 dark:text-green-400'
    label = 'Active'
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
      >
        <svg
          className="w-3 h-3 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        {label}
      </span>
      {showDate && (
        <span className="text-xs text-gray-500">
          {format(expiry, 'MMM d, yyyy')}
        </span>
      )}
    </div>
  )
}

export function WarrantyIcon({ expiryDate, size = 'sm' }) {
  if (!expiryDate) return null

  const today = new Date()
  const expiry = parseISO(expiryDate)
  const daysRemaining = differenceInDays(expiry, today)

  let color
  if (daysRemaining < 0) {
    color = 'text-gray-400'
  } else if (daysRemaining <= 30) {
    color = 'text-red-500'
  } else if (daysRemaining <= 60) {
    color = 'text-yellow-500'
  } else if (daysRemaining <= 90) {
    color = 'text-blue-500'
  } else {
    color = 'text-green-500'
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <svg
      className={`${sizeClasses[size]} ${color}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      title={`Warranty expires ${format(expiry, 'MMM d, yyyy')}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  )
}
