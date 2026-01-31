import Card from '../common/Card'

export default function AmmoCard({ ammo, onClick }) {
  const getQuantityColor = (qty) => {
    if (qty <= 50) return 'text-red-600 dark:text-red-400'
    if (qty <= 100) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

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
          <span className={`text-lg font-bold ${getQuantityColor(ammo.quantity)}`}>
            {ammo.quantity?.toLocaleString() || 0}
          </span>
        </div>

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
