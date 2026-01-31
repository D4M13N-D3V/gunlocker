import { useState, useEffect } from 'react'
import { useRangeTrip, useCreateRangeTrip, useUpdateRangeTrip } from '../../hooks/useRangeTrips'
import { useFirearms } from '../../hooks/useFirearms'

export default function RangeTripForm({ tripId, onClose }) {
  const { data: existingTrip, isLoading: loadingTrip } = useRangeTrip(tripId)
  const { data: firearms } = useFirearms()
  const createTrip = useCreateRangeTrip()
  const updateTrip = useUpdateRangeTrip()

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    location: '',
    firearms_used: [],
    notes: '',
    weather: '',
    duration: '',
  })

  useEffect(() => {
    if (existingTrip) {
      setFormData({
        date: existingTrip.date?.split('T')[0] || '',
        location: existingTrip.location || '',
        firearms_used: existingTrip.firearms_used || [],
        notes: existingTrip.notes || '',
        weather: existingTrip.weather || '',
        duration: existingTrip.duration || '',
      })
    }
  }, [existingTrip])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'number' ? (value ? parseFloat(value) : '') : value }))
  }

  const handleFirearmToggle = (firearmId) => {
    setFormData((prev) => ({
      ...prev,
      firearms_used: prev.firearms_used.includes(firearmId)
        ? prev.firearms_used.filter((id) => id !== firearmId)
        : [...prev.firearms_used, firearmId],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (tripId) { await updateTrip.mutateAsync({ id: tripId, data: formData }) }
      else { await createTrip.mutateAsync(formData) }
      onClose()
    } catch (error) {}
  }

  const isLoading = createTrip.isPending || updateTrip.isPending
  if (tripId && loadingTrip) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Date *</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required className="input" />
        </div>
        <div>
          <label className="label">Location *</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="Range name" className="input" />
        </div>
        <div>
          <label className="label">Duration (hours)</label>
          <input type="number" name="duration" value={formData.duration} onChange={handleChange} min="0" step="0.5" className="input" />
        </div>
        <div>
          <label className="label">Weather</label>
          <input type="text" name="weather" value={formData.weather} onChange={handleChange} placeholder="Sunny, 75F" className="input" />
        </div>
      </div>

      <div>
        <label className="label">Firearms Used</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
          {firearms?.map((firearm) => (
            <label key={firearm.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.firearms_used.includes(firearm.id)}
                onChange={() => handleFirearmToggle(firearm.id)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm truncate">{firearm.name}</span>
            </label>
          ))}
          {(!firearms || firearms.length === 0) && (
            <p className="text-sm text-gray-500 col-span-full text-center py-4">No firearms available</p>
          )}
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="input" placeholder="Session notes..." />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : tripId ? 'Update' : 'Log Trip'}</button>
      </div>
    </form>
  )
}
