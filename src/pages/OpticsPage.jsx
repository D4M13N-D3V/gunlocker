import { useState } from 'react'
import OpticsList from '../components/optics/OpticsList'
import OpticsForm from '../components/optics/OpticsForm'
import Modal from '../components/common/Modal'

export default function OpticsPage() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Optics</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">Add Optic</button>
      </div>
      <OpticsList />
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Optic" size="lg">
        <OpticsForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  )
}
