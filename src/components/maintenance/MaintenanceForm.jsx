import { useState, useEffect } from 'react'
import { useMaintenanceLog, useCreateMaintenance, useUpdateMaintenance, useDeleteMaintenance, MAINTENANCE_TYPES } from '../../hooks/useMaintenance'
import { useFirearms } from '../../hooks/useFirearms'
import PhotoUpload from '../common/PhotoUpload'

export default function MaintenanceForm({ logId, firearmId, onClose }) {
  const { data: existingLog, isLoading: loadingLog } = useMaintenanceLog(logId)
  const { data: firearms } = useFirearms()
  const createMaintenance = useCreateMaintenance()
  const updateMaintenance = useUpdateMaintenance()
  const deleteMaintenance = useDeleteMaintenance()

  const [formData, setFormData] = useState({
    firearm: firearmId || '',
    date: new Date().toISOString().split('T')[0],
    type: 'cleaning',
    rounds_since_last: '',
    description: '',
    parts_replaced: '',
    cost: '',
    notes: '',
  })
  const [photos, setPhotos] = useState([])
  const [existingPhotos, setExistingPhotos] = useState([])

  useEffect(() => {
    if (existingLog) {
      setFormData({
        firearm: existingLog.firearm || '',
        date: existingLog.date?.split('T')[0] || '',
        type: existingLog.type || 'cleaning',
        rounds_since_last: existingLog.rounds_since_last || '',
        description: existingLog.description || '',
        parts_replaced: existingLog.parts_replaced || '',
        cost: existingLog.cost || '',
        notes: existingLog.notes || '',
      })
      setExistingPhotos(existingLog.photos || [])
    }
  }, [existingLog])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'number' ? (value ? parseFloat(value) : '') : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...formData, photos }
    try {
      if (logId) { await updateMaintenance.mutateAsync({ id: logId, data }) }
      else { await createMaintenance.mutateAsync(data) }
      onClose()
    } catch (error) {}
  }

  const handleDelete = async () => {
    if (window.confirm('Delete this maintenance log?')) { await deleteMaintenance.mutateAsync(logId); onClose() }
  }

  const isLoading = createMaintenance.isPending || updateMaintenance.isPending
  if (logId && loadingLog) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Firearm *</label>
          <select name="firearm" value={formData.firearm} onChange={handleChange} required className="input" disabled={!!firearmId}>
            <option value="">Select firearm</option>
            {firearms?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date *</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required className="input" />
        </div>
        <div>
          <label className="label">Type *</label>
          <select name="type" value={formData.type} onChange={handleChange} required className="input">
            {MAINTENANCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Rounds Since Last</label>
          <input type="number" name="rounds_since_last" value={formData.rounds_since_last} onChange={handleChange} min="0" className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="input" placeholder="What was done..." />
        </div>
        <div>
          <label className="label">Parts Replaced</label>
          <input type="text" name="parts_replaced" value={formData.parts_replaced} onChange={handleChange} className="input" placeholder="Springs, etc." />
        </div>
        <div>
          <label className="label">Cost</label>
          <input type="number" name="cost" value={formData.cost} onChange={handleChange} min="0" step="0.01" className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="input" />
        </div>
      </div>
      <div>
        <label className="label">Photos</label>
        <PhotoUpload photos={photos} onChange={setPhotos} existingPhotos={existingPhotos} record={existingLog} onRemoveExisting={(p) => setExistingPhotos(existingPhotos.filter((x) => x !== p))} />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        {logId && <button type="button" onClick={handleDelete} className="btn-danger" disabled={deleteMaintenance.isPending}>Delete</button>}
        <div className={`flex items-center gap-3 ${!logId ? 'ml-auto' : ''}`}>
          <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : logId ? 'Update' : 'Log Maintenance'}</button>
        </div>
      </div>
    </form>
  )
}
