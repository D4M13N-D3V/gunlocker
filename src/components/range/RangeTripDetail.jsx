import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useRangeTrip, useRangeTripAmmo, useDeleteRangeTrip, useCreateRangeTripAmmo } from '../../hooks/useRangeTrips'
import { useAmmunition } from '../../hooks/useAmmunition'
import Card, { CardBody, CardHeader } from '../common/Card'
import Modal from '../common/Modal'
import RangeTripForm from './RangeTripForm'

export default function RangeTripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAmmoModal, setShowAmmoModal] = useState(false)
  const [ammoFormData, setAmmoFormData] = useState({ firearm: '', ammunition: '', rounds_fired: '', notes: '' })

  const { data: trip, isLoading } = useRangeTrip(id)
  const { data: ammoUsage } = useRangeTripAmmo(id)
  const { data: ammunition } = useAmmunition()
  const deleteTrip = useDeleteRangeTrip()
  const createAmmoUsage = useCreateRangeTripAmmo()

  const handleDelete = async () => {
    await deleteTrip.mutateAsync(id)
    navigate('/range-trips')
  }

  const handleAmmoSubmit = async (e) => {
    e.preventDefault()
    await createAmmoUsage.mutateAsync({
      range_trip: id,
      ...ammoFormData,
      rounds_fired: parseInt(ammoFormData.rounds_fired),
    })
    setShowAmmoModal(false)
    setAmmoFormData({ firearm: '', ammunition: '', rounds_fired: '', notes: '' })
  }

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
  if (!trip) return <div className="text-center py-12"><p className="text-red-500">Trip not found</p><Link to="/range-trips" className="text-primary-600 hover:underline mt-2 inline-block">Back to trips</Link></div>

  const totalRounds = ammoUsage?.reduce((sum, a) => sum + (a.rounds_fired || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/range-trips" className="hover:text-primary-600">Range Trips</Link>
            <span>/</span>
            <span>{format(new Date(trip.date), 'MMM d, yyyy')}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{trip.location}</h1>
          <p className="text-gray-500">{format(new Date(trip.date), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAmmoModal(true)} className="btn-primary">Log Ammo</button>
          <button onClick={() => setShowEditModal(true)} className="btn-secondary">Edit</button>
          <button onClick={() => setShowDeleteModal(true)} className="btn-danger">Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-900 dark:text-white">Trip Details</h2></CardHeader>
            <CardBody>
              <dl className="grid grid-cols-2 gap-4">
                <div><dt className="text-sm text-gray-500">Duration</dt><dd className="font-medium text-gray-900 dark:text-white">{trip.duration ? `${trip.duration} hours` : '-'}</dd></div>
                <div><dt className="text-sm text-gray-500">Weather</dt><dd className="font-medium text-gray-900 dark:text-white">{trip.weather || '-'}</dd></div>
                <div><dt className="text-sm text-gray-500">Total Rounds</dt><dd className="font-medium text-gray-900 dark:text-white">{totalRounds.toLocaleString()}</dd></div>
                <div><dt className="text-sm text-gray-500">Firearms</dt><dd className="font-medium text-gray-900 dark:text-white">{trip.expand?.firearms_used?.length || 0}</dd></div>
              </dl>
              {trip.notes && <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"><dt className="text-sm text-gray-500 mb-1">Notes</dt><dd className="text-gray-900 dark:text-white whitespace-pre-wrap">{trip.notes}</dd></div>}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Ammunition Used</h2>
              <button onClick={() => setShowAmmoModal(true)} className="text-sm text-primary-600 hover:text-primary-700">Add</button>
            </CardHeader>
            <CardBody>
              {ammoUsage?.length > 0 ? (
                <div className="space-y-3">
                  {ammoUsage.map((usage) => (
                    <div key={usage.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{usage.expand?.firearm?.name}</p>
                        <p className="text-sm text-gray-500">{usage.expand?.ammunition?.brand} {usage.expand?.ammunition?.caliber}</p>
                      </div>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">{usage.rounds_fired}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No ammo usage logged</p>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-900 dark:text-white">Firearms Used</h2></CardHeader>
            <CardBody>
              {trip.expand?.firearms_used?.length > 0 ? (
                <ul className="space-y-2">
                  {trip.expand.firearms_used.map((f) => (
                    <li key={f.id}><Link to={`/firearms/${f.id}`} className="text-primary-600 hover:underline">{f.name}</Link></li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No firearms recorded</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Range Trip" size="lg">
        <RangeTripForm tripId={id} onClose={() => setShowEditModal(false)} />
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Range Trip">
        <p className="text-gray-600 dark:text-gray-400">Delete this range trip? This cannot be undone.</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger" disabled={deleteTrip.isPending}>{deleteTrip.isPending ? 'Deleting...' : 'Delete'}</button>
        </div>
      </Modal>

      <Modal isOpen={showAmmoModal} onClose={() => setShowAmmoModal(false)} title="Log Ammunition Usage">
        <form onSubmit={handleAmmoSubmit} className="space-y-4">
          <div>
            <label className="label">Firearm *</label>
            <select value={ammoFormData.firearm} onChange={(e) => setAmmoFormData({ ...ammoFormData, firearm: e.target.value })} required className="input">
              <option value="">Select firearm</option>
              {trip.expand?.firearms_used?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Ammunition</label>
            <select value={ammoFormData.ammunition} onChange={(e) => setAmmoFormData({ ...ammoFormData, ammunition: e.target.value })} className="input">
              <option value="">Select ammo (optional)</option>
              {ammunition?.map((a) => <option key={a.id} value={a.id}>{a.brand} {a.caliber} - {a.quantity} available</option>)}
            </select>
          </div>
          <div>
            <label className="label">Rounds Fired *</label>
            <input type="number" value={ammoFormData.rounds_fired} onChange={(e) => setAmmoFormData({ ...ammoFormData, rounds_fired: e.target.value })} required min="1" className="input" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea value={ammoFormData.notes} onChange={(e) => setAmmoFormData({ ...ammoFormData, notes: e.target.value })} rows={2} className="input" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => setShowAmmoModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={createAmmoUsage.isPending}>{createAmmoUsage.isPending ? 'Saving...' : 'Log Ammo'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
