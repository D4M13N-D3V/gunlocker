import { useState } from 'react'
import AccessoryList from '../components/accessories/AccessoryList'
import AccessoryForm from '../components/accessories/AccessoryForm'
import Modal from '../components/common/Modal'

export default function AccessoriesPage() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accessories</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">Add Accessory</button>
      </div>
      <AccessoryList />
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Accessory" size="lg">
        <AccessoryForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  )
}
