import { useState } from 'react'
import GearList from '../components/gear/GearList'
import GearForm from '../components/gear/GearForm'
import Modal from '../components/common/Modal'

export default function GearPage() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gear</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">Add Gear</button>
      </div>
      <GearList />
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Gear" size="lg">
        <GearForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  )
}
