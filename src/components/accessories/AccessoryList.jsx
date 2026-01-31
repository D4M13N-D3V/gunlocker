import { useState, useMemo } from 'react'
import { useAccessories, ACCESSORY_CATEGORIES } from '../../hooks/useAccessories'
import AccessoryCard from './AccessoryCard'
import SearchBar from '../common/SearchBar'
import Modal from '../common/Modal'
import AccessoryForm from './AccessoryForm'

export default function AccessoryList() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedAccessory, setSelectedAccessory] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)

  const { data: accessories, isLoading, error } = useAccessories()

  const filteredAccessories = useMemo(() => {
    if (!accessories) return []
    return accessories.filter((item) => {
      const matchesSearch = !search ||
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.brand?.toLowerCase().includes(search.toLowerCase()) ||
        item.model?.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !categoryFilter || item.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [accessories, search, categoryFilter])

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
  if (error) return <div className="text-center py-12 text-red-500">Failed to load accessories.</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search accessories..." /></div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
          <option value="">All Categories</option>
          {ACCESSORY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <p className="text-sm text-gray-500">{filteredAccessories.length} accessor{filteredAccessories.length !== 1 ? 'ies' : 'y'}</p>
      {filteredAccessories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccessories.map((item) => (
            <AccessoryCard key={item.id} accessory={item} onClick={() => { setSelectedAccessory(item); setShowFormModal(true) }} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">{search || categoryFilter ? 'No accessories match your filters' : 'No accessories yet.'}</div>
      )}
      <Modal isOpen={showFormModal} onClose={() => { setShowFormModal(false); setSelectedAccessory(null) }} title={selectedAccessory ? 'Edit Accessory' : 'Add Accessory'} size="lg">
        <AccessoryForm accessoryId={selectedAccessory?.id} onClose={() => { setShowFormModal(false); setSelectedAccessory(null) }} />
      </Modal>
    </div>
  )
}
