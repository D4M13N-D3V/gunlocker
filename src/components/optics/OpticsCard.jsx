import Card from '../common/Card'
import { WarrantyIcon } from '../common/WarrantyBadge'
import { getThumbUrl } from '../../lib/pocketbase'
import { OPTIC_TYPES } from '../../hooks/useOptics'

export default function OpticsCard({ optic, onClick }) {
  const photoUrl = optic.photos?.[0] ? getThumbUrl(optic, optic.photos[0], '200x200') : null
  const typeLabel = OPTIC_TYPES.find((t) => t.value === optic.type)?.label || optic.type

  return (
    <Card hover onClick={onClick} className="cursor-pointer overflow-hidden">
      <div className="flex gap-3 p-4">
        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {photoUrl ? (
            <img src={photoUrl} alt={optic.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{optic.name}</h3>
            {optic.warranty_expires && <WarrantyIcon expiryDate={optic.warranty_expires} />}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{typeLabel}</p>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {optic.brand && <span>{optic.brand}</span>}
            {optic.magnification && <span>{optic.magnification}</span>}
          </div>
          {optic.expand?.mounted_on && (
            <p className="mt-1 text-xs text-primary-600">Mounted on: {optic.expand.mounted_on.name}</p>
          )}
        </div>
      </div>
    </Card>
  )
}
