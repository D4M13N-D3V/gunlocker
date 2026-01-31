import { useState, useMemo } from 'react'
import { useAmmunition } from '../../hooks/useAmmunition'
import AmmoCard from './AmmoCard'
import SearchBar from '../common/SearchBar'
import Modal from '../common/Modal'
import AmmoForm from './AmmoForm'

export default function AmmoList() {
  const [search, setSearch] = useState('')
  const [caliberFilter, setCaliberFilter] = useState('')
  const [selectedAmmo, setSelectedAmmo] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)

  const { data: ammunition, isLoading, error } = useAmmunition()

  const calibers = useMemo(() => {
    if (!ammunition) return []
    const unique = [...new Set(ammunition.map((a) => a.caliber).filter(Boolean))]
    return unique.sort()
  }, [ammunition])

  const filteredAmmo = useMemo(() => {
    if (!ammunition) return []

    return ammunition.filter((ammo) => {
      const matchesSearch =
        !search ||
        ammo.brand?.toLowerCase().includes(search.toLowerCase()) ||
        ammo.type?.toLowerCase().includes(search.toLowerCase()) ||
        ammo.caliber?.toLowerCase().includes(search.toLowerCase()) ||
        ammo.lot_number?.toLowerCase().includes(search.toLowerCase())

      const matchesCaliber = !caliberFilter || ammo.caliber === caliberFilter

      return matchesSearch && matchesCaliber
    })
  }, [ammunition, search, caliberFilter])

  const groupedByCaliber = useMemo(() => {
    const groups = {}
    filteredAmmo.forEach((ammo) => {
      const caliber = ammo.caliber || 'Other'
      if (!groups[caliber]) {
        groups[caliber] = { items: [], total: 0 }
      }
      groups[caliber].items.push(ammo)
      groups[caliber].total += ammo.quantity || 0
    })
    return groups
  }, [filteredAmmo])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Failed to load ammunition. Please try again.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search ammunition..."
          />
        </div>
        <select
          value={caliberFilter}
          onChange={(e) => setCaliberFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">All Calibers</option>
          {calibers.map((cal) => (
            <option key={cal} value={cal}>
              {cal}
            </option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(groupedByCaliber).map(([caliber, data]) => (
          <span
            key={caliber}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
          >
            {caliber}: <span className="font-semibold">{data.total.toLocaleString()}</span>
          </span>
        ))}
      </div>

      {/* Grid */}
      {filteredAmmo.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAmmo.map((ammo) => (
            <AmmoCard
              key={ammo.id}
              ammo={ammo}
              onClick={() => {
                setSelectedAmmo(ammo)
                setShowFormModal(true)
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {search || caliberFilter
            ? 'No ammunition matches your filters'
            : 'No ammunition yet. Add your first ammo!'}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setSelectedAmmo(null)
        }}
        title={selectedAmmo ? 'Edit Ammunition' : 'Add Ammunition'}
        size="lg"
      >
        <AmmoForm
          ammoId={selectedAmmo?.id}
          onClose={() => {
            setShowFormModal(false)
            setSelectedAmmo(null)
          }}
        />
      </Modal>
    </div>
  )
}
