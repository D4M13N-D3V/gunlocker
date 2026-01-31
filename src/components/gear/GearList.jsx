import { useState, useMemo } from 'react'
import { useGear, GEAR_CATEGORIES } from '../../hooks/useGear'
import GearCard from './GearCard'
import SearchBar from '../common/SearchBar'
import Modal from '../common/Modal'
import GearForm from './GearForm'

export default function GearList() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedGear, setSelectedGear] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)

  const { data: gear, isLoading, error } = useGear()

  const filteredGear = useMemo(() => {
    if (!gear) return []

    return gear.filter((item) => {
      const matchesSearch =
        !search ||
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.brand?.toLowerCase().includes(search.toLowerCase()) ||
        item.model?.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = !categoryFilter || item.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [gear, search, categoryFilter])

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
        Failed to load gear. Please try again.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search gear..."
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">All Categories</option>
          {GEAR_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500">
        {filteredGear.length} item{filteredGear.length !== 1 ? 's' : ''}
      </p>

      {filteredGear.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGear.map((item) => (
            <GearCard
              key={item.id}
              gear={item}
              onClick={() => {
                setSelectedGear(item)
                setShowFormModal(true)
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {search || categoryFilter
            ? 'No gear matches your filters'
            : 'No gear yet. Add your first item!'}
        </div>
      )}

      <Modal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setSelectedGear(null)
        }}
        title={selectedGear ? 'Edit Gear' : 'Add Gear'}
        size="lg"
      >
        <GearForm
          gearId={selectedGear?.id}
          onClose={() => {
            setShowFormModal(false)
            setSelectedGear(null)
          }}
        />
      </Modal>
    </div>
  )
}
