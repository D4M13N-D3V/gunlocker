import { useState, useEffect } from 'react'
import { useAccessory, useCreateAccessory, useUpdateAccessory, useDeleteAccessory, ACCESSORY_CATEGORIES } from '../../hooks/useAccessories'
import { useFirearms } from '../../hooks/useFirearms'
import PhotoUpload from '../common/PhotoUpload'
import DocumentUpload from '../common/DocumentUpload'

export default function AccessoryForm({ accessoryId, onClose }) {
  const { data: existingAccessory, isLoading: loadingAccessory } = useAccessory(accessoryId)
  const { data: firearms } = useFirearms()
  const createAccessory = useCreateAccessory()
  const updateAccessory = useUpdateAccessory()
  const deleteAccessory = useDeleteAccessory()

  const [formData, setFormData] = useState({
    name: '', category: 'other', brand: '', model: '', serial_number: '',
    purchase_date: '', purchase_price: '', warranty_expires: '', mounted_on: '', notes: '',
  })
  const [photos, setPhotos] = useState([])
  const [documents, setDocuments] = useState([])
  const [existingPhotos, setExistingPhotos] = useState([])
  const [existingDocuments, setExistingDocuments] = useState([])

  useEffect(() => {
    if (existingAccessory) {
      setFormData({
        name: existingAccessory.name || '', category: existingAccessory.category || 'other',
        brand: existingAccessory.brand || '', model: existingAccessory.model || '',
        serial_number: existingAccessory.serial_number || '', purchase_date: existingAccessory.purchase_date?.split('T')[0] || '',
        purchase_price: existingAccessory.purchase_price || '', warranty_expires: existingAccessory.warranty_expires?.split('T')[0] || '',
        mounted_on: existingAccessory.mounted_on || '', notes: existingAccessory.notes || '',
      })
      setExistingPhotos(existingAccessory.photos || [])
      setExistingDocuments(existingAccessory.documents || [])
    }
  }, [existingAccessory])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'number' ? (value ? parseFloat(value) : '') : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...formData, photos, documents }
    try {
      if (accessoryId) { await updateAccessory.mutateAsync({ id: accessoryId, data }) }
      else { await createAccessory.mutateAsync(data) }
      onClose()
    } catch (error) {}
  }

  const handleDelete = async () => {
    if (window.confirm('Delete this accessory?')) { await deleteAccessory.mutateAsync(accessoryId); onClose() }
  }

  const isLoading = createAccessory.isPending || updateAccessory.isPending
  if (accessoryId && loadingAccessory) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="label">Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="input" /></div>
        <div><label className="label">Category *</label><select name="category" value={formData.category} onChange={handleChange} className="input">{ACCESSORY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
        <div><label className="label">Brand</label><input type="text" name="brand" value={formData.brand} onChange={handleChange} className="input" /></div>
        <div><label className="label">Model</label><input type="text" name="model" value={formData.model} onChange={handleChange} className="input" /></div>
        <div><label className="label">Serial Number</label><input type="text" name="serial_number" value={formData.serial_number} onChange={handleChange} className="input" /></div>
        <div><label className="label">Mounted On</label><select name="mounted_on" value={formData.mounted_on} onChange={handleChange} className="input"><option value="">Not Mounted</option>{firearms?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
        <div><label className="label">Purchase Date</label><input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleChange} className="input" /></div>
        <div><label className="label">Purchase Price</label><input type="number" name="purchase_price" value={formData.purchase_price} onChange={handleChange} min="0" step="0.01" className="input" /></div>
        <div className="md:col-span-2"><label className="label">Warranty Expires</label><input type="date" name="warranty_expires" value={formData.warranty_expires} onChange={handleChange} className="input" /></div>
      </div>
      <div><label className="label">Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="input" /></div>
      <div><label className="label">Photos</label><PhotoUpload photos={photos} onChange={setPhotos} existingPhotos={existingPhotos} record={existingAccessory} onRemoveExisting={(p) => setExistingPhotos(existingPhotos.filter((x) => x !== p))} /></div>
      <div><label className="label">Documents</label><DocumentUpload documents={documents} onChange={setDocuments} existingDocuments={existingDocuments} record={existingAccessory} onRemoveExisting={(d) => setExistingDocuments(existingDocuments.filter((x) => x !== d))} /></div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        {accessoryId && <button type="button" onClick={handleDelete} className="btn-danger" disabled={deleteAccessory.isPending}>Delete</button>}
        <div className={`flex items-center gap-3 ${!accessoryId ? 'ml-auto' : ''}`}>
          <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : accessoryId ? 'Update' : 'Add Accessory'}</button>
        </div>
      </div>
    </form>
  )
}
