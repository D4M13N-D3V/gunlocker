import { Link } from 'react-router-dom'
import Card from '../common/Card'
import AutoRotateImage from '../common/AutoRotateImage'
import { WarrantyIcon } from '../common/WarrantyBadge'
import { getThumbUrl } from '../../lib/pocketbase'

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  sold: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
  stored: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  repair: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

const TYPE_LABELS = {
  handgun: 'Handgun',
  rifle: 'Rifle',
  shotgun: 'Shotgun',
  other: 'Other',
}

export default function FirearmCard({ firearm }) {
  const photoUrl = firearm.photos?.[0]
    ? getThumbUrl(firearm, firearm.photos[0], '300x200')
    : null

  return (
    <Link to={`/firearms/${firearm.id}`}>
      <Card hover className="overflow-hidden">
        {/* Image */}
        <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
          {photoUrl ? (
            <AutoRotateImage
              src={photoUrl}
              alt={firearm.name}
              className="w-full h-full object-cover"
              containerClassName="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-300 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 12h16M4 12l2-4h10l2 4M4 12v4h2v-2h12v2h2v-4"
                />
              </svg>
            </div>
          )}
          {/* Status badge */}
          {firearm.status && (
            <span
              className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[firearm.status]}`}
            >
              {firearm.status}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {firearm.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {firearm.make} {firearm.model}
              </p>
            </div>
            {firearm.warranty_expires && (
              <WarrantyIcon expiryDate={firearm.warranty_expires} />
            )}
          </div>

          <div className="mt-3 flex items-center gap-3 text-sm">
            {firearm.type && (
              <span className="text-gray-600 dark:text-gray-400">
                {TYPE_LABELS[firearm.type]}
              </span>
            )}
            {firearm.caliber && (
              <span className="text-gray-600 dark:text-gray-400">
                {firearm.caliber}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {firearm.round_count?.toLocaleString() || 0} rounds
            </span>
            {firearm.purchase_price && (
              <span className="font-medium text-gray-900 dark:text-white">
                ${firearm.purchase_price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
