import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateFirearm, useUpdateFirearm, useFirearm } from '../../hooks/useFirearms'
import PhotoUpload from '../common/PhotoUpload'
import DocumentUpload from '../common/DocumentUpload'

const TYPE_OPTIONS = [
  { value: 'handgun', label: 'Handgun' },
  { value: 'rifle', label: 'Rifle' },
  { value: 'shotgun', label: 'Shotgun' },
  { value: 'other', label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'stored', label: 'Stored' },
  { value: 'repair', label: 'In Repair' },
  { value: 'sold', label: 'Sold' },
]

export default function FirearmForm({ firearmId, onClose }) {
  const navigate = useNavigate()
  const { data: existingFirearm, isLoading: loadingFirearm } = useFirearm(firearmId)
  const createFirearm = useCreateFirearm()
  const updateFirearm = useUpdateFirearm()

  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    serial_number: '',
    caliber: '',
    type: 'handgun',
    purchase_date: '',
    purchase_price: '',
    current_value: '',
    purchase_location: '',
    warranty_expires: '',
    notes: '',
    round_count: 0,
    status: 'active',
  })

  const [photos, setPhotos] = useState([])
  const [documents, setDocuments] = useState([])
  const [existingPhotos, setExistingPhotos] = useState([])
  const [existingDocuments, setExistingDocuments] = useState([])

  useEffect(() => {
    if (existingFirearm) {
      setFormData({
        name: existingFirearm.name || '',
        make: existingFirearm.make || '',
        model: existingFirearm.model || '',
        serial_number: existingFirearm.serial_number || '',
        caliber: existingFirearm.caliber || '',
        type: existingFirearm.type || 'handgun',
        purchase_date: existingFirearm.purchase_date?.split('T')[0] || '',
        purchase_price: existingFirearm.purchase_price || '',
        current_value: existingFirearm.current_value || '',
        purchase_location: existingFirearm.purchase_location || '',
        warranty_expires: existingFirearm.warranty_expires?.split('T')[0] || '',
        notes: existingFirearm.notes || '',
        round_count: existingFirearm.round_count || 0,
        status: existingFirearm.status || 'active',
      })
      setExistingPhotos(existingFirearm.photos || [])
      setExistingDocuments(existingFirearm.documents || [])
    }
  }, [existingFirearm])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : '') : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = {
      ...formData,
      photos,
      documents,
    }

    try {
      if (firearmId) {
        await updateFirearm.mutateAsync({ id: firearmId, data })
      } else {
        await createFirearm.mutateAsync(data)
      }
      onClose ? onClose() : navigate('/firearms')
    } catch (error) {
      // Error handled by mutation
    }
  }

  const isLoading = createFirearm.isPending || updateFirearm.isPending

  if (firearmId && loadingFirearm) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 dark:text-white">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Glock 19 Gen 5"
              className="input"
            />
          </div>

          <div>
            <label className="label">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Make</label>
            <input
              type="text"
              name="make"
              value={formData.make}
              onChange={handleChange}
              placeholder="e.g., Glock"
              className="input"
            />
          </div>

          <div>
            <label className="label">Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g., 19 Gen 5"
              className="input"
            />
          </div>

          <div>
            <label className="label">Caliber</label>
            <input
              type="text"
              name="caliber"
              value={formData.caliber}
              onChange={handleChange}
              placeholder="e.g., 9mm"
              className="input"
            />
          </div>

          <div>
            <label className="label">Serial Number</label>
            <input
              type="text"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Round Count</label>
            <input
              type="number"
              name="round_count"
              value={formData.round_count}
              onChange={handleChange}
              min="0"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Purchase Info */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 dark:text-white">Purchase Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Purchase Date</label>
            <input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Purchase Price</label>
            <input
              type="number"
              name="purchase_price"
              value={formData.purchase_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="input"
            />
          </div>

          <div>
            <label className="label">Current Value</label>
            <input
              type="number"
              name="current_value"
              value={formData.current_value}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Blue Book value"
              className="input"
            />
          </div>

          <div>
            <label className="label">Purchase Location</label>
            <input
              type="text"
              name="purchase_location"
              value={formData.purchase_location}
              onChange={handleChange}
              placeholder="e.g., Local Gun Store"
              className="input"
            />
          </div>

          <div>
            <label className="label">Warranty Expires</label>
            <input
              type="date"
              name="warranty_expires"
              value={formData.warranty_expires}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="input"
          placeholder="Additional notes..."
        />
      </div>

      {/* Photos */}
      <div>
        <label className="label">Photos</label>
        <PhotoUpload
          photos={photos}
          onChange={setPhotos}
          existingPhotos={existingPhotos}
          record={existingFirearm}
          onRemoveExisting={(photo) => {
            setExistingPhotos(existingPhotos.filter((p) => p !== photo))
          }}
        />
      </div>

      {/* Documents */}
      <div>
        <label className="label">Documents</label>
        <DocumentUpload
          documents={documents}
          onChange={setDocuments}
          existingDocuments={existingDocuments}
          record={existingFirearm}
          onRemoveExisting={(doc) => {
            setExistingDocuments(existingDocuments.filter((d) => d !== doc))
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => (onClose ? onClose() : navigate('/firearms'))}
          className="btn-secondary"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : firearmId ? 'Update Firearm' : 'Add Firearm'}
        </button>
      </div>
    </form>
  )
}
