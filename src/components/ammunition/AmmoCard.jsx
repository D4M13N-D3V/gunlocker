import Card from '../common/Card'

export default function AmmoCard({ ammo, onClick }) {
  const getQuantityColor = (qty, purchased) => {
    if (!purchased) purchased = qty
    const percent = (qty / purchased) * 100
    if (percent <= 20) return 'text-red-600 dark:text-red-400'
    if (percent <= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const used = (ammo.purchased_quantity || ammo.quantity) - ammo.quantity
  const usedPercent = ammo.purchased_quantity
    ? Math.round((used / ammo.purchased_quantity) * 100)
    : 0

  return (
    <Card hover onClick={onClick} className="cursor-pointer">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {ammo.brand} {ammo.type}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {ammo.caliber} {ammo.grain && `- ${ammo.grain}gr`}
            </p>
          </div>
          <div className="text-right">
            <span className={`text-lg font-bold ${getQuantityColor(ammo.quantity, ammo.purchased_quantity)}`}>
              {ammo.quantity?.toLocaleString() || 0}
            </span>
            {ammo.purchased_quantity && ammo.purchased_quantity !== ammo.quantity && (
              <p className="text-xs text-gray-500">
                of {ammo.purchased_quantity.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Usage bar */}
        {ammo.purchased_quantity > 0 && (
          <div className="mt-2">
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  usedPercent >= 80 ? 'bg-red-500' :
                  usedPercent >= 50 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${100 - usedPercent}%` }}
              />
            </div>
            {used > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {used.toLocaleString()} used ({usedPercent}%)
              </p>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-sm">
          {ammo.lot_number && (
            <span className="text-gray-500">Lot: {ammo.lot_number}</span>
          )}
          {ammo.purchase_price && (
            <span className="text-gray-600 dark:text-gray-400">
              ${ammo.purchase_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
