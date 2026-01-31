import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import RangeTripList from '../components/range/RangeTripList'
import RangeTripDetail from '../components/range/RangeTripDetail'
import RangeTripForm from '../components/range/RangeTripForm'
import Modal from '../components/common/Modal'

function RangeTripsIndex() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Range Trips</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">Log Trip</button>
      </div>
      <RangeTripList />
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Log Range Trip" size="lg">
        <RangeTripForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  )
}

export default function RangeTripsPage() {
  return (
    <Routes>
      <Route index element={<RangeTripsIndex />} />
      <Route path=":id" element={<RangeTripDetail />} />
    </Routes>
  )
}
