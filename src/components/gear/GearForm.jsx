import { useState, useEffect } from 'react'
import { useGearItem, useCreateGear, useUpdateGear, useDeleteGear, GEAR_CATEGORIES, CONDITION_OPTIONS } from '../../hooks/useGear'
import { useFirearms } from '../../hooks/useFirearms'
import PhotoUpload from '../common/PhotoUpload'
import DocumentUpload from '../common/DocumentUpload'

export default function GearForm({ gearId, onClose }) {
  const { data: existingGear, isLoading: loadingGear } = useGearItem(gearId)
  const { data: firearms } = useFirearms()
  const createGear = useCreateGear()
  const updateGear = useUpdateGear()
  const deleteGear = useDeleteGear()

  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    brand: '',
    model: '',
    serial_number: '',
    quantity: 1,
    purchase_date: '',
    purchase_price: '',
    warranty_expires: '',
    condition: 'new',
    notes: '',
    linked_firearm: '',
  })

  const [photos, setPhotos] = useState([])
  const [documents, setDocuments] = useState([])
  const [existingPhotos, setExistingPhotos] = useState([])
  const [existingDocuments, setExistingDocuments] = useState([])

  useEffect(() => {
    if (existingGear) {
      setFormData({
        name: existingGear.name || '',
        category: existingGear.category || 'other',
        brand: existingGear.brand || '',
        model: existingGear.model || '',
        serial_number: existingGear.serial_number || '',
        quantity: existingGear.quantity || 1,
        purchase_date: existingGear.purchase_date?.split('T')[0] || '',
        purchase_price: existingGear.purchase_price || '',
        warranty_expires: existingGear.warranty_expires?.split('T')[0] || '',
        condition: existingGear.condition || 'new',
        notes: existingGear.notes || '',
        linked_firearm: existingGear.linked_firearm || '',
      })
      setExistingPhotos(existingGear.photos || [])
      setExistingDocuments(existingGear.documents || [])
    }
  }, [existingGear])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : '') : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = { ...formData, photos, documents }

    try {
      if (gearId) {
        await updateGear.mutateAsync({ id: gearId, data })
      } else {
        await createGear.mutateAsync(data)
      }
      onClose()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this gear?')) {
      await deleteGear.mutateAsync(gearId)
      onClose()
    }
  }

  const isLoading = createGear.isPending || updateGear.isPending

  if (gearId && loadingGear) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input"
          />
        </div>

        <div>
          <label className="label">Category *</label>
          <select name="category" value={formData.category} onChange={handleChange} className="input">
            {GEAR_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Brand</label>
          <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="input" />
        </div>

        <div>
          <label className="label">Model</label>
          <input type="text" name="model" value={formData.model} onChange={handleChange} className="input" />
        </div>

        <div>
          <label className="label">Serial Number</label>
          <input type="text" name="serial_number" value={formData.serial_number} onChange={handleChange} className="input" />
        </div>

        <div>
          <label className="label">Quantity</label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" className="input" />
        </div>

        <div>
          <label className="label">Condition</label>
          <select name="condition" value={formData.condition} onChange={handleChange} className="input">
            {CONDITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Linked Firearm</label>
          <select name="linked_firearm" value={formData.linked_firearm} onChange={handleChange} className="input">
            <option value="">None</option>
            {firearms?.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Purchase Date</label>
          <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleChange} className="input" />
        </div>

        <div>
          <label className="label">Purchase Price</label>
          <input type="number" name="purchase_price" value={formData.purchase_price} onChange={handleChange} min="0" step="0.01" className="input" />
        </div>

        <div className="md:col-span-2">
          <label className="label">Warranty Expires</label>
          <input type="date" name="warranty_expires" value={formData.warranty_expires} onChange={handleChange} className="input" />
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="input" />
      </div>

      <div>
        <label className="label">Photos</label>
        <PhotoUpload photos={photos} onChange={setPhotos} existingPhotos={existingPhotos} record={existingGear} onRemoveExisting={(p) => setExistingPhotos(existingPhotos.filter((x) => x !== p))} />
      </div>

      <div>
        <label className="label">Documents</label>
        <DocumentUpload documents={documents} onChange={setDocuments} existingDocuments={existingDocuments} record={existingGear} onRemoveExisting={(d) => setExistingDocuments(existingDocuments.filter((x) => x !== d))} />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        {gearId && (
          <button type="button" onClick={handleDelete} className="btn-danger" disabled={deleteGear.isPending}>Delete</button>
        )}
        <div className={`flex items-center gap-3 ${!gearId ? 'ml-auto' : ''}`}>
          <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : gearId ? 'Update' : 'Add Gear'}
          </button>
        </div>
      </div>
    </form>
  )
}
