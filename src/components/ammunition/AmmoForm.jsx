import { useState, useEffect } from 'react'
import { useAmmo, useCreateAmmo, useUpdateAmmo, useDeleteAmmo } from '../../hooks/useAmmunition'

export default function AmmoForm({ ammoId, onClose }) {
  const { data: existingAmmo, isLoading: loadingAmmo } = useAmmo(ammoId)
  const createAmmo = useCreateAmmo()
  const updateAmmo = useUpdateAmmo()
  const deleteAmmo = useDeleteAmmo()

  const [formData, setFormData] = useState({
    brand: '',
    caliber: '',
    grain: '',
    type: '',
    quantity: 0,
    lot_number: '',
    purchase_date: '',
    purchase_price: '',
    notes: '',
  })

  useEffect(() => {
    if (existingAmmo) {
      setFormData({
        brand: existingAmmo.brand || '',
        caliber: existingAmmo.caliber || '',
        grain: existingAmmo.grain || '',
        type: existingAmmo.type || '',
        quantity: existingAmmo.quantity || 0,
        lot_number: existingAmmo.lot_number || '',
        purchase_date: existingAmmo.purchase_date?.split('T')[0] || '',
        purchase_price: existingAmmo.purchase_price || '',
        notes: existingAmmo.notes || '',
      })
    }
  }, [existingAmmo])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : '') : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (ammoId) {
        await updateAmmo.mutateAsync({ id: ammoId, data: formData })
      } else {
        await createAmmo.mutateAsync(formData)
      }
      onClose()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this ammunition?')) {
      await deleteAmmo.mutateAsync(ammoId)
      onClose()
    }
  }

  const isLoading = createAmmo.isPending || updateAmmo.isPending

  if (ammoId && loadingAmmo) {
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
          <label className="label">Brand *</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            placeholder="e.g., Federal"
            className="input"
          />
        </div>

        <div>
          <label className="label">Caliber *</label>
          <input
            type="text"
            name="caliber"
            value={formData.caliber}
            onChange={handleChange}
            required
            placeholder="e.g., 9mm"
            className="input"
          />
        </div>

        <div>
          <label className="label">Grain</label>
          <input
            type="number"
            name="grain"
            value={formData.grain}
            onChange={handleChange}
            placeholder="e.g., 124"
            className="input"
          />
        </div>

        <div>
          <label className="label">Type</label>
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleChange}
            placeholder="e.g., FMJ, HP"
            className="input"
          />
        </div>

        <div>
          <label className="label">Quantity *</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="0"
            className="input"
          />
        </div>

        <div>
          <label className="label">Lot Number</label>
          <input
            type="text"
            name="lot_number"
            value={formData.lot_number}
            onChange={handleChange}
            className="input"
          />
        </div>

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
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="input"
          placeholder="Performance notes..."
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        {ammoId && (
          <button
            type="button"
            onClick={handleDelete}
            className="btn-danger"
            disabled={deleteAmmo.isPending}
          >
            Delete
          </button>
        )}
        <div className={`flex items-center gap-3 ${!ammoId ? 'ml-auto' : ''}`}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : ammoId ? 'Update' : 'Add Ammunition'}
          </button>
        </div>
      </div>
    </form>
  )
}
