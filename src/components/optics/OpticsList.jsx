import { useState, useMemo } from 'react'
import { useOptics, OPTIC_TYPES } from '../../hooks/useOptics'
import OpticsCard from './OpticsCard'
import SearchBar from '../common/SearchBar'
import Modal from '../common/Modal'
import OpticsForm from './OpticsForm'

export default function OpticsList() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedOptic, setSelectedOptic] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)

  const { data: optics, isLoading, error } = useOptics()

  const filteredOptics = useMemo(() => {
    if (!optics) return []
    return optics.filter((item) => {
      const matchesSearch = !search ||
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.brand?.toLowerCase().includes(search.toLowerCase()) ||
        item.model?.toLowerCase().includes(search.toLowerCase())
      const matchesType = !typeFilter || item.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [optics, search, typeFilter])

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Failed to load optics.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Search optics..." />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
          <option value="">All Types</option>
          {OPTIC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <p className="text-sm text-gray-500">{filteredOptics.length} optic{filteredOptics.length !== 1 ? 's' : ''}</p>

      {filteredOptics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOptics.map((item) => (
            <OpticsCard key={item.id} optic={item} onClick={() => { setSelectedOptic(item); setShowFormModal(true) }} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">{search || typeFilter ? 'No optics match your filters' : 'No optics yet.'}</div>
      )}

      <Modal isOpen={showFormModal} onClose={() => { setShowFormModal(false); setSelectedOptic(null) }} title={selectedOptic ? 'Edit Optic' : 'Add Optic'} size="lg">
        <OpticsForm opticId={selectedOptic?.id} onClose={() => { setShowFormModal(false); setSelectedOptic(null) }} />
      </Modal>
    </div>
  )
}
