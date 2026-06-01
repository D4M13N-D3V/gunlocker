import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import pb, { getUserId } from '../lib/pocketbase'
import { buildCreateBody, buildUpdateBody } from '../lib/records'
import toast from 'react-hot-toast'

const COLLECTION = 'maintenance_logs'
const FILE_FIELDS = ['photos']

export function useMaintenance(options = {}) {
  return useQuery({
    queryKey: [COLLECTION, options],
    queryFn: async () => {
      const { filter = '', sort = '-date', expand = 'firearm' } = options
      return pb.collection(COLLECTION).getFullList({
        filter,
        sort,
        expand,
      })
    },
  })
}

export function useMaintenanceForFirearm(firearmId) {
  return useQuery({
    queryKey: [COLLECTION, 'firearm', firearmId],
    queryFn: async () => {
      if (!firearmId) return []
      return pb.collection(COLLECTION).getFullList({
        filter: `firearm = "${firearmId}"`,
        sort: '-date',
      })
    },
    enabled: !!firearmId,
  })
}

export function useMaintenanceLog(id) {
  return useQuery({
    queryKey: [COLLECTION, id],
    queryFn: async () => {
      if (!id) return null
      return pb.collection(COLLECTION).getOne(id, {
        expand: 'firearm,user',
      })
    },
    enabled: !!id,
  })
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data) => {
      const body = buildCreateBody(data, { fileFields: FILE_FIELDS, extra: { user: getUserId() } })
      return pb.collection(COLLECTION).create(body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Maintenance log added')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add maintenance log')
    },
  })
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data, removed }) => {
      const body = buildUpdateBody(data, { fileFields: FILE_FIELDS, removed })
      return pb.collection(COLLECTION).update(id, body)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: [COLLECTION, id] })
      toast.success('Maintenance log updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update maintenance log')
    },
  })
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      return pb.collection(COLLECTION).delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COLLECTION] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Maintenance log deleted')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete maintenance log')
    },
  })
}

export const MAINTENANCE_TYPES = [
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'lubrication', label: 'Lubrication' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'repair', label: 'Repair' },
  { value: 'parts_replacement', label: 'Parts Replacement' },
  { value: 'other', label: 'Other' },
]
