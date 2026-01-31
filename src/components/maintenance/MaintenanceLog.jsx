import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { useMaintenance, MAINTENANCE_TYPES } from '../../hooks/useMaintenance'
import Card, { CardBody } from '../common/Card'
import SearchBar from '../common/SearchBar'
import Modal from '../common/Modal'
import MaintenanceForm from './MaintenanceForm'

export default function MaintenanceLog() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedLog, setSelectedLog] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)

  const { data: logs, isLoading, error } = useMaintenance()

  const filteredLogs = useMemo(() => {
    if (!logs) return []
    return logs.filter((log) => {
      const matchesSearch = !search ||
        log.description?.toLowerCase().includes(search.toLowerCase()) ||
        log.expand?.firearm?.name?.toLowerCase().includes(search.toLowerCase())
      const matchesType = !typeFilter || log.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [logs, search, typeFilter])

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
  if (error) return <div className="text-center py-12 text-red-500">Failed to load maintenance logs.</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search logs..." /></div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
          <option value="">All Types</option>
          {MAINTENANCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <p className="text-sm text-gray-500">{filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}</p>

      {filteredLogs.length > 0 ? (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <Card key={log.id} hover onClick={() => { setSelectedLog(log); setShowFormModal(true) }} className="cursor-pointer">
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{log.type?.replace('_', ' ')}</span>
                      <span className="text-sm text-gray-500">{format(new Date(log.date), 'MMM d, yyyy')}</span>
                    </div>
                    {log.expand?.firearm && (
                      <p className="text-sm text-primary-600">{log.expand.firearm.name}</p>
                    )}
                    {log.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{log.description}</p>
                    )}
                    {log.cost > 0 && (
                      <p className="text-sm text-gray-500 mt-1">Cost: ${log.cost.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">{search || typeFilter ? 'No logs match your filters' : 'No maintenance logs yet.'}</div>
      )}

      <Modal isOpen={showFormModal} onClose={() => { setShowFormModal(false); setSelectedLog(null) }} title={selectedLog ? 'Edit Maintenance Log' : 'Add Maintenance Log'} size="lg">
        <MaintenanceForm logId={selectedLog?.id} onClose={() => { setShowFormModal(false); setSelectedLog(null) }} />
      </Modal>
    </div>
  )
}
