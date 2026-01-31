import { useState } from 'react'
import AmmoList from '../components/ammunition/AmmoList'
import AmmoForm from '../components/ammunition/AmmoForm'
import Modal from '../components/common/Modal'

export default function AmmunitionPage() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ammunition</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          Add Ammunition
        </button>
      </div>

      <AmmoList />

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Ammunition" size="lg">
        <AmmoForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  )
}
