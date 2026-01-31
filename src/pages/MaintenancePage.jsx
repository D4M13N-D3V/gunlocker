import { useState } from 'react'
import MaintenanceLog from '../components/maintenance/MaintenanceLog'
import MaintenanceForm from '../components/maintenance/MaintenanceForm'
import Modal from '../components/common/Modal'

export default function MaintenancePage() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">Log Maintenance</button>
      </div>
      <MaintenanceLog />
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Log Maintenance" size="lg">
        <MaintenanceForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  )
}
