import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useFirearm, useDeleteFirearm } from '../../hooks/useFirearms'
import { useMaintenanceForFirearm } from '../../hooks/useMaintenance'
import { useOptics } from '../../hooks/useOptics'
import { useAccessories } from '../../hooks/useAccessories'
import Card, { CardBody, CardHeader } from '../common/Card'
import Modal from '../common/Modal'
import WarrantyBadge from '../common/WarrantyBadge'
import FirearmForm from './FirearmForm'
import MaintenanceForm from '../maintenance/MaintenanceForm'
import { getFileUrl, getThumbUrl } from '../../lib/pocketbase'

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  sold: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
  stored: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  repair: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

export default function FirearmDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  const { data: firearm, isLoading, error } = useFirearm(id)
  const { data: maintenanceLogs } = useMaintenanceForFirearm(id)
  const { data: optics } = useOptics({ filter: `mounted_on = '${id}'` })
  const { data: accessories } = useAccessories({ filter: `mounted_on = '${id}'` })
  const deleteFirearm = useDeleteFirearm()

  const handleDelete = async () => {
    await deleteFirearm.mutateAsync(id)
    navigate('/firearms')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !firearm) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Firearm not found</p>
        <Link to="/firearms" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to firearms
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/firearms" className="hover:text-primary-600">
              Firearms
            </Link>
            <span>/</span>
            <span>{firearm.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {firearm.name}
          </h1>
          <p className="text-gray-500">
            {firearm.make} {firearm.model}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMaintenanceModal(true)}
            className="btn-secondary"
          >
            Log Maintenance
          </button>
          <button onClick={() => setShowEditModal(true)} className="btn-secondary">
            Edit
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="btn-danger">
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          {firearm.photos?.length > 0 && (
            <Card>
              <CardBody>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {firearm.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhoto(photo)}
                      className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={getThumbUrl(firearm, photo, '200x200')}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Details */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900 dark:text-white">Details</h2>
            </CardHeader>
            <CardBody>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Type</dt>
                  <dd className="font-medium text-gray-900 dark:text-white capitalize">
                    {firearm.type || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Caliber</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {firearm.caliber || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Serial Number</dt>
                  <dd className="font-medium text-gray-900 dark:text-white font-mono">
                    {firearm.serial_number || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[firearm.status] || STATUS_COLORS.active}`}
                    >
                      {firearm.status || 'active'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Round Count</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {firearm.round_count?.toLocaleString() || 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Purchase Date</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {firearm.purchase_date
                      ? format(new Date(firearm.purchase_date), 'MMM d, yyyy')
                      : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Purchase Price</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {firearm.purchase_price
                      ? `$${firearm.purchase_price.toLocaleString()}`
                      : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Purchase Location</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {firearm.purchase_location || '-'}
                  </dd>
                </div>
              </dl>

              {firearm.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <dt className="text-sm text-gray-500 mb-1">Notes</dt>
                  <dd className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {firearm.notes}
                  </dd>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Maintenance History */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Maintenance History
              </h2>
              <button
                onClick={() => setShowMaintenanceModal(true)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Add Log
              </button>
            </CardHeader>
            <CardBody>
              {maintenanceLogs?.length > 0 ? (
                <div className="space-y-3">
                  {maintenanceLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {log.type?.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(log.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {log.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {log.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No maintenance logs yet</p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Warranty */}
          {firearm.warranty_expires && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-900 dark:text-white">Warranty</h2>
              </CardHeader>
              <CardBody>
                <WarrantyBadge expiryDate={firearm.warranty_expires} showDate />
              </CardBody>
            </Card>
          )}

          {/* Mounted Optics */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900 dark:text-white">Mounted Optics</h2>
            </CardHeader>
            <CardBody>
              {optics?.length > 0 ? (
                <ul className="space-y-2">
                  {optics.map((optic) => (
                    <li key={optic.id}>
                      <Link
                        to={`/optics`}
                        className="text-primary-600 hover:underline"
                      >
                        {optic.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No optics mounted</p>
              )}
            </CardBody>
          </Card>

          {/* Accessories */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900 dark:text-white">Accessories</h2>
            </CardHeader>
            <CardBody>
              {accessories?.length > 0 ? (
                <ul className="space-y-2">
                  {accessories.map((accessory) => (
                    <li key={accessory.id}>
                      <Link
                        to={`/accessories`}
                        className="text-primary-600 hover:underline"
                      >
                        {accessory.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No accessories attached</p>
              )}
            </CardBody>
          </Card>

          {/* Documents */}
          {firearm.documents?.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-900 dark:text-white">Documents</h2>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2">
                  {firearm.documents.map((doc, index) => (
                    <li key={index}>
                      <a
                        href={getFileUrl(firearm, doc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline text-sm flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {doc}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Firearm"
        size="lg"
      >
        <FirearmForm firearmId={id} onClose={() => setShowEditModal(false)} />
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Firearm"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete <strong>{firearm.name}</strong>? This action
          cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger"
            disabled={deleteFirearm.isPending}
          >
            {deleteFirearm.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>

      {/* Maintenance Modal */}
      <Modal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        title="Log Maintenance"
        size="lg"
      >
        <MaintenanceForm
          firearmId={id}
          onClose={() => setShowMaintenanceModal(false)}
        />
      </Modal>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setSelectedPhoto(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            src={getFileUrl(firearm, selectedPhoto)}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
