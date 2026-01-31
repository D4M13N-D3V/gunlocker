import Card from '../common/Card'
import { WarrantyIcon } from '../common/WarrantyBadge'
import { getThumbUrl } from '../../lib/pocketbase'
import { ACCESSORY_CATEGORIES } from '../../hooks/useAccessories'

export default function AccessoryCard({ accessory, onClick }) {
  const photoUrl = accessory.photos?.[0] ? getThumbUrl(accessory, accessory.photos[0], '200x200') : null
  const categoryLabel = ACCESSORY_CATEGORIES.find((c) => c.value === accessory.category)?.label || accessory.category

  return (
    <Card hover onClick={onClick} className="cursor-pointer overflow-hidden">
      <div className="flex gap-3 p-4">
        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {photoUrl ? (
            <img src={photoUrl} alt={accessory.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{accessory.name}</h3>
            {accessory.warranty_expires && <WarrantyIcon expiryDate={accessory.warranty_expires} />}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{categoryLabel}</p>
          {accessory.brand && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{accessory.brand}</p>}
          {accessory.expand?.mounted_on && (
            <p className="mt-1 text-xs text-primary-600">On: {accessory.expand.mounted_on.name}</p>
          )}
        </div>
      </div>
    </Card>
  )
}
