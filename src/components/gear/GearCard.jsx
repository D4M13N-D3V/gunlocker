import Card from '../common/Card'
import { WarrantyIcon } from '../common/WarrantyBadge'
import { getThumbUrl } from '../../lib/pocketbase'
import { GEAR_CATEGORIES, CONDITION_OPTIONS } from '../../hooks/useGear'

export default function GearCard({ gear, onClick }) {
  const photoUrl = gear.photos?.[0]
    ? getThumbUrl(gear, gear.photos[0], '200x200')
    : null

  const categoryLabel = GEAR_CATEGORIES.find((c) => c.value === gear.category)?.label || gear.category
  const conditionLabel = CONDITION_OPTIONS.find((c) => c.value === gear.condition)?.label

  return (
    <Card hover onClick={onClick} className="cursor-pointer overflow-hidden">
      <div className="flex gap-3 p-4">
        {/* Image */}
        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={gear.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-300 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {gear.name}
            </h3>
            {gear.warranty_expires && (
              <WarrantyIcon expiryDate={gear.warranty_expires} />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {categoryLabel}
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm">
            {gear.brand && (
              <span className="text-gray-600 dark:text-gray-400">{gear.brand}</span>
            )}
            {conditionLabel && (
              <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                {conditionLabel}
              </span>
            )}
            {gear.quantity > 1 && (
              <span className="text-gray-600 dark:text-gray-400">
                x{gear.quantity}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
