import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useInventory } from '../hooks/useInventory'
import Card, { CardBody, CardHeader } from '../components/common/Card'
import SearchBar from '../components/common/SearchBar'
import { WarrantyIcon } from '../components/common/WarrantyBadge'

const CATEGORY_LABELS = {
  firearm: 'Firearm',
  ammunition: 'Ammunition',
  gear: 'Gear',
  optic: 'Optic',
  accessory: 'Accessory',
}

const CATEGORY_COLORS = {
  firearm: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ammunition: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  gear: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  optic: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  accessory: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState('created')

  const { data: inventory, isLoading, error } = useInventory()

  const filteredItems = useMemo(() => {
    if (!inventory?.all) return []

    let items = inventory.all.filter((item) => {
      const matchesSearch = !search ||
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.brand?.toLowerCase().includes(search.toLowerCase()) ||
        item.model?.toLowerCase().includes(search.toLowerCase()) ||
        item.serial_number?.toLowerCase().includes(search.toLowerCase()) ||
        item.caliber?.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = !categoryFilter || item._category === categoryFilter

      return matchesSearch && matchesCategory
    })

    // Sort
    items.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'value':
          return (b.purchase_price || 0) - (a.purchase_price || 0)
        case 'created':
        default:
          return new Date(b.created) - new Date(a.created)
      }
    })

    return items
  }, [inventory, search, categoryFilter, sortBy])

  const totalValue = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + (item.purchase_price || 0), 0)
  }, [filteredItems])

  const exportToCsv = () => {
    const headers = ['Category', 'Name', 'Brand', 'Model', 'Serial Number', 'Purchase Date', 'Purchase Price', 'Notes']
    const rows = filteredItems.map((item) => [
      CATEGORY_LABELS[item._category],
      item.name || '',
      item.brand || '',
      item.model || '',
      item.serial_number || '',
      item.purchase_date ? format(new Date(item.purchase_date), 'yyyy-MM-dd') : '',
      item.purchase_price || '',
      item.notes || '',
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gun-locker-inventory-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Failed to load inventory.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Full Inventory</h1>
          <p className="text-gray-500">{filteredItems.length} items - ${totalValue.toLocaleString()} total value</p>
        </div>
        <button onClick={exportToCsv} className="btn-secondary">Export CSV</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search all items..." />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="created">Newest First</option>
          <option value="name">Name A-Z</option>
          <option value="value">Value (High to Low)</option>
        </select>
      </div>

      {filteredItems.length > 0 ? (
        <div className="overflow-hidden">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warranty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredItems.map((item) => (
                    <tr key={`${item._category}-${item.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[item._category]}`}>
                          {CATEGORY_LABELS[item._category]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.name || `${item.brand} ${item.type || ''}`}</p>
                          {item.serial_number && (
                            <p className="text-xs text-gray-500 font-mono">{item.serial_number}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.brand && <span>{item.brand} </span>}
                          {item.model && <span>{item.model} </span>}
                          {item.caliber && <span>- {item.caliber}</span>}
                          {item.quantity && item.quantity > 1 && <span> x{item.quantity}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {item.purchase_price ? (
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${item.purchase_price.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.warranty_expires ? (
                          <WarrantyIcon expiryDate={item.warranty_expires} />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {search || categoryFilter ? 'No items match your filters' : 'No inventory items yet.'}
        </div>
      )}
    </div>
  )
}
