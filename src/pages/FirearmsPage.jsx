import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import FirearmList from '../components/firearms/FirearmList'
import FirearmDetail from '../components/firearms/FirearmDetail'
import FirearmForm from '../components/firearms/FirearmForm'
import Modal from '../components/common/Modal'

function FirearmsIndex() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Firearms</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          Add Firearm
        </button>
      </div>

      <FirearmList />

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Firearm"
        size="lg"
      >
        <FirearmForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  )
}

export default function FirearmsPage() {
  return (
    <Routes>
      <Route index element={<FirearmsIndex />} />
      <Route path=":id" element={<FirearmDetail />} />
    </Routes>
  )
}
